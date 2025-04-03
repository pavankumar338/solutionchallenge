import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image

# Define class names (Replace these with your actual class labels)
class_names = ['Nail_psoriasis', 'SJS-TEN', 'Vitiligo', 'acne', 'hyperpigmentation']  # Example classes

# Load the trained model
@st.cache_resource
def load_model():
    model = tf.keras.models.load_model(r"C:\Users\pavan\Downloads\saved_model.keras")
    return model

model = load_model()

# Define function to preprocess image
def preprocess_image(image):
    img = image.resize((180, 180))  # Resize to model input size
    img = np.array(img) / 255.0  # Normalize
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

# Streamlit UI
st.title("🖼️ Image Classification with Keras Model")
st.write("Upload an image to test the model.")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "png", "jpeg"])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)
    
    if st.button("Predict"):
        img_array = preprocess_image(image)
        predictions = model.predict(img_array)
        predicted_class_index = np.argmax(predictions, axis=1)[0]

        # Get class name from index
        predicted_class = class_names[predicted_class_index]  

        st.success(f"Predicted Class: {predicted_class}")
