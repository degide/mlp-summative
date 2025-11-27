import io
import numpy as np
from keras.utils import load_img
from models import load_model_resources, image_size


def predict_image(image_bytes: bytes) -> str | None:
    """
    Loads, preprocesses, and predicts the class of an image.
    :param image_bytes: Raw image data from the API request.
    :return: The predicted class name or None if error occur.
    """

    saved_model, saved_model_info = load_model_resources()

    if not saved_model or not saved_model_info:
        return None 
    
    image = load_img(io.BytesIO(image_bytes), target_size=image_size)
    image = np.array([image])
    predicted_label_probs = saved_model.predict(image/255.0)
    predicted_index = np.argmax(predicted_label_probs)
    predicted_class = sorted(saved_model_info['classes'])[predicted_index]
    
    return predicted_class