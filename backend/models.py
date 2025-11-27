import pickle
import json
from os import path
import os
from keras.models import Sequential
from pydantic import BaseModel
import tensorflow as tf

# disable GPU usage for the API server (optional, keeps it lightweight)
tf.config.set_visible_devices([], 'GPU')

class PredictionResponse(BaseModel):
    predicted_class: str
    
class StatusResponse(BaseModel):
    model_name: str
    status: str
    model_info: dict

image_size = (224, 224)

# Define paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = path.join(BASE_DIR, '..', 'model', 'animal_classifier_model.pkl')
INFO_PATH = path.join(BASE_DIR, '..', 'model', 'animal_classifier_model.info.json')

def load_model_resources() -> tuple[Sequential | None, dict | None]:
    """Helper to load resources safely."""
    model = Sequential | None
    info = dict | None
    try:
        if path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
        
        if path.exists(INFO_PATH):
            with open(INFO_PATH, 'r', encoding='utf-8') as f:
                info = json.load(f)
                
    except Exception as e:
        print(f"Error loading model or model info: {e}")
    
    return model, info
