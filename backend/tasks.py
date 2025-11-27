import os
import json
import pickle
import time
import numpy as np
from celery import Celery
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam

try:
    tf.config.set_visible_devices([], 'GPU')
except:
    pass  # If no GPU is present, ignore

# Initialize Celery
celery_app = Celery(
    'animal_classifier_worker',
    broker=os.getenv("REDIS_URL") or "redis://localhost:8201/0",
    backend=os.getenv("REDIS_URL") or "redis://localhost:8201/0"
)

# Configuration
DATASET_PATH = os.path.join("..", "data", "raw")
MODEL_DIR = os.path.join("..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, 'animal_classifier_model.pkl')
INFO_PATH = os.path.join(MODEL_DIR, 'animal_classifier_model.info.json')

@celery_app.task(bind=True)
def retrain_model_task(self):
    """
    Celery task to retrain the model based on data in ../data/raw
    """
    try:
        self.update_state(state='STARTED', meta={'status': 'Initializing training...'})
        
        if not os.path.exists(DATASET_PATH):
            return {"status": "Failed", "error": "Dataset directory not found."}

        # 1. Data Preparation
        batch_size = 32
        image_size = (224, 224)

        # Using ImageDataGenerator for loading and augmentation
        datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=0.2,
            rotation_range=20,
            horizontal_flip=True
        )

        train_generator = datagen.flow_from_directory(
            DATASET_PATH,
            target_size=image_size,
            batch_size=batch_size,
            class_mode='categorical',
            subset='training'
        )

        validation_generator = datagen.flow_from_directory(
            DATASET_PATH,
            target_size=image_size,
            batch_size=batch_size,
            class_mode='categorical',
            subset='validation'
        )

        if train_generator.samples == 0:
            return {"status": "Failed", "error": "No images found in data directory."}

        classes = list(train_generator.class_indices.keys())
        num_classes = len(classes)
        
        self.update_state(state='TRAINING', meta={'status': f'Training on {num_classes} classes...'})

        # 2. Model Architecture (Transfer Learning)
        # We rebuild the model to ensure it fits the new number of classes
        base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        
        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False

        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(64, activation='relu')(x)
        predictions = Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)

        model.compile(optimizer=Adam(learning_rate=0.0001),
                      loss='categorical_crossentropy',
                      metrics=['accuracy'])

        # 3. Training
        history = model.fit(
            train_generator,
            epochs=3, 
            validation_data=validation_generator,
            verbose=1
        )

        final_accuracy = history.history['accuracy'][-1]
        self.update_state(state='SAVING', meta={'status': 'Saving model...'})

        # 4. Saving

        os.makedirs(MODEL_DIR, exist_ok=True)

        # Save Metadata
        model_info = {
            "classes": classes,
            "accuracy": float(final_accuracy),
            "last_trained": time.strftime("%Y-%m-%d %H:%M:%S"),
            "num_samples": train_generator.samples
        }
        
        with open(INFO_PATH, 'w', encoding='utf-8') as f:
            json.dump(model_info, f, indent=4)

        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model, f)

        return {
            "status": "Completed", 
            "accuracy": final_accuracy, 
            "classes": classes
        }

    except Exception as e:
        return {"status": "Failed", "error": str(e)}