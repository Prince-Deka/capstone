from flask import Flask, send_from_directory, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import os

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
model = load_model('path_to_your_model.h5')

def prepare_image(image):
    """ Preprocess the image to fit model's input requirements. """
    image = image.resize((48, 48))
    image = image.convert('L')
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/analyze', methods=['POST'])
def analyze():
    img_file = request.files['image']
    image = Image.open(img_file.stream)
    prepared_image = prepare_image(image)
    predictions = model.predict(prepared_image)
    emotion_index = np.argmax(predictions)
    return jsonify({'emotion_index': emotion_index})

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=3000)
