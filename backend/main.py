import os
import shutil
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
from prediction import predict_image
from models import load_model_resources, StatusResponse, PredictionResponse
from fastapi.middleware.cors import CORSMiddleware
import tasks

# Load environment variables if needed
from dotenv import load_dotenv
load_dotenv("./.env")

# Initialize FastAPI app
app = FastAPI(title="Animal Classifier API", 
              description="ML Pipeline for Image Classification with Celery Retraining",
              version="1.1.0",
              openapi_url="/openapi.json",
              servers=[{"url": "/", "description": "Local server"}])

# Configure cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = os.path.join("..", "data", "raw")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/status", response_model=StatusResponse, tags=["Monitor"])
def get_status():
    """Check model information and status."""

    saved_model, saved_model_info = load_model_resources()

    return {
        "model_name": "ResNet50_Animal_Classifier",
        "status": "Online" if saved_model_info else "Model Not Loaded",
        "model_info": {
            **saved_model_info,
            "classes": sorted(saved_model_info['classes']),
        } if saved_model_info else {},
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(file: UploadFile = File(...)):
    """Allow a user to predict one datapoint from an image."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        image_bytes = await file.read()
        prediction = predict_image(image_bytes)
        
        if prediction is None:
            raise HTTPException(status_code=500, detail="Prediction failed. Model might not be loaded.")

        return {"predicted_class": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/retrain/upload", tags=["Retraining"])
async def upload_training_data(
    class_name: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Upload new data for retraining.
    Requires a 'class_name' (e.g., 'Cat', 'Dog') and a list of files.
    """
    # Sanitize class name to prevent directory traversal
    safe_class_name = "".join([c for c in class_name if c.isalnum() or c in (' ', '_')]).strip()
    if not safe_class_name:
        raise HTTPException(status_code=400, detail="Invalid class name")

    class_path = os.path.join(UPLOAD_DIR, safe_class_name)
    os.makedirs(class_path, exist_ok=True)

    saved_count = 0
    for file in files:
        if file.content_type.startswith('image/'):
            file_path = os.path.join(class_path, file.filename)
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                saved_count += 1
            except Exception as e:
                print(f"Failed to save {file.filename}: {e}")
                
    return {
        "message": f"Successfully uploaded {saved_count} images for class '{safe_class_name}'",
        "target_directory": class_path
    }

@app.post("/retrain/trigger", tags=["Retraining"])
def trigger_retraining():
    """
    Triggers the Celery background task to retrain the model.
    """
    # Call the Celery task asynchronously
    task = tasks.retrain_model_task.delay()
    
    return {
        "message": "Retraining task initiated.",
        "task_id": task.id,
        "status": "Processing"
    }

@app.get("/visualizations", tags=["Visualizations"])
def get_visualizations() -> Dict[str, Any]:
    """Returns data for frontend visualizations."""
    
    class_counts = {}
    total_images = 0
    
    if os.path.exists(UPLOAD_DIR):
        for class_name in os.listdir(UPLOAD_DIR):
            class_path = os.path.join(UPLOAD_DIR, class_name)
            if os.path.isdir(class_path):
                count = len(os.listdir(class_path))
                class_counts[class_name] = count
                total_images += count

    return {
        "class_distribution": {
            **class_counts,
        },
        "new_data_size": {
            "total_images": total_images,
            "ready_to_train": "Yes" if total_images > 10 else "No (Need more data)",
            "message": f"Currently {total_images} images available in the dataset directory."
        }
    }