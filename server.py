from flask import Flask, request, jsonify, send_file,make_response
import tensorflow as tf
import os
import multiprocessing
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import numpy as np
import pandas
from datetime import timedelta

import nltk
nltk.download("wordnet")
import random
import pickle
import json
from keras.models import load_model
from nltk.stem import WordNetLemmatizer




app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/surya.m/Documents/CIAECO/zoom-ui/users.db'
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, origins='*')  # Allow requests from all origins




# Load the chat model (replace 'path_to_your_model' with the actual path)
# chat_model = tf.keras.models.load_model('model.h5')

lemmatizer = WordNetLemmatizer()
intents = json.loads(open("intents.json").read())
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))
model = load_model('chatbotmodel.h5')
  


# Load the cloth identification model (replace 'path_to_cloth_model' with the actual path)
cloth_model = tf.keras.models.load_model('custom_fashion_model.h5')

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class UploadedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    prediction = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('files', lazy=True))

# Set a folder to store uploaded pictures
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to process uploaded picture
def process_uploaded_picture(filename):
    # Load and preprocess the image for cloth identification
    img = tf.keras.preprocessing.image.load_img(filename, target_size=(224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    # img_array = tf.expand_dims(img_array, 0)
    # img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

    # # Make predictions using the cloth identification model
    # predictions = cloth_model.predict(img_array)
    # predicted_class = tf.keras.applications.mobilenet_v2.decode_predictions(predictions.numpy())[0][0][1]

    # return predicted_class

    # ax = plt.subplot(4, 4, i + 1)
    # path = random.choice(custom_paths)
    # image = tf.keras.preprocessing.image.load_img(path, target_size=(224, 224))
    # input_arr = tf.keras.preprocessing.image.img_to_array(image)
    input_arr = np.array([img_array])
    input_arr = input_arr.astype('float32') / 255.
    output = cloth_model.predict(input_arr, verbose=0)
    classes=['Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 'Longsleeve', 'Outwear', 'Pants', 'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skirt', 'T-Shirt', 'Top', 'Undershirt']
    series = pandas.Series(output[0], index=classes)
    predicted_classes = np.argsort(output)
    output.sort()
    response = f"{classes[predicted_classes[0][-1]]} - {round(output[0][-1] * 100,2)}% \n{classes[predicted_classes[0][-2]]} - {round(output[0][-2] * 100,2)}% \n{classes[predicted_classes[0][-3]]} - {round(output[0][-2] * 100,3)}%"
    return response
      


# Background routine for cloth identification and data storage
def cloth_identification_routine(filename):
    try:
        predicted_class = process_uploaded_picture(filename)

        # Store the data (you can replace this with your data storage logic)
        with open('cloth_data.txt', 'a') as f:
            f.write(f"Uploaded image: {filename}, Predicted class: {predicted_class}\n")
    except Exception as e:
        print(f"Error processing image: {str(e)}")

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 409

        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token), 200

    return jsonify({"message": "Invalid credentials"}), 401


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        input_text = data['input_text']
        response = generate_response(input_text)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def clean_up_sentences(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word)
                      for word in sentence_words]
    return sentence_words
  
def bagw(sentence):
    sentence_words = clean_up_sentences(sentence)
    bag = [0]*len(words)
    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1
    return np.array(bag)

def predict_class(sentence):
    bow = bagw(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res)
               if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({'intent': classes[r[0]],
                            'probability': str(r[1])})
        return return_list

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']
    list_of_intents = intents_json['intents']
    result = ""
    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['responses'])
            break
    return result

def generate_response(input_text):
    # Add your code here to process the input_text using the loaded model
    # You can use the 'model' object to generate a response
    # For example:
    # response = model.predict([input_text])
    ints = predict_class(input_text)
    response = get_response(ints, intents)
    return response


# Route to upload picture
# @app.route('/api/upload', methods=['POST'])
# def upload_picture():
#     try:
#         if 'file' not in request.files:
#             return jsonify({"error": "No file part"}), 400

#         file = request.files['file']

#         if file.filename == '':
#             return jsonify({"error": "No selected file"}), 400

#         if file:
#             filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
#             file.save(filename)
#             return jsonify({"message": "File uploaded successfully", "filename": filename})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_picture():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        username = get_jwt_identity()

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file:
            user_upload_folder = os.path.join(app.config['UPLOAD_FOLDER'], username)
            if not os.path.exists(user_upload_folder):
                os.makedirs(user_upload_folder)

            filename = os.path.join(user_upload_folder, file.filename)
            file.save(filename)

            # Save file metadata to the database
            file_type = file.content_type
            
            predection_path = "{}".format(filename)
            predection = process_uploaded_picture(predection_path)
            user = User.query.filter_by(username=username).first()
            new_file = UploadedFile(filename=file.filename, filepath=filename,file_type=file_type, user=user,prediction=predection)
            db.session.add(new_file)
            db.session.commit()
            
            return jsonify({"message": "File uploaded successfully", "filename": file.filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/uploads', methods=['GET'])
@jwt_required()
def get_user_uploads():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    if user:
        uploads = [
            {
                "filename": file.filename,
                "filepath": file.filepath,
                "file_type": file.file_type,
                "prediction": file.prediction
            }
            for file in user.files
        ]
        return jsonify(uploads)
    
    return jsonify({"message": "User not found"}), 404


@app.route('/api/uploads/<filename>', methods=['DELETE'])
@jwt_required()
def delete_uploaded_picture(filename):
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        if user:
            file_to_delete = UploadedFile.query.filter_by(filename=filename, user=user).first()

            if file_to_delete:
                db.session.delete(file_to_delete)
                db.session.commit()

                file_path = os.path.join(app.config['UPLOAD_FOLDER'], username, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)

                return jsonify({"message": "File deleted successfully"}), 200
            else:
                return jsonify({"error": "File not found or not owned by user"}), 404

        return jsonify({"message": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/uploads/<username>/<filename>', methods=['GET'])
# @jwt_required()
def serve_uploaded_picture(username,filename):
    # username = get_jwt_identity()
    user_upload_folder = os.path.join(app.config['UPLOAD_FOLDER'], username)
    requested_file = os.path.join(user_upload_folder, filename)
    
    if os.path.exists(requested_file):
        return send_file(requested_file)
    else:
        return jsonify({"error": "File not found"}), 404

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Set to 24 hours

@app.route('/api/uilogin', methods=['POST'])
def uilogin():
    try:
        username = request.json.get('username')
        password = request.json.get('password')

        user = User.query.filter_by(username=username).first()

        if user and user.password == password:
            access_token = create_access_token(identity=user.username)

            # Create a response with the token and set it as a cookie
            response = make_response(jsonify(access_token=access_token), 200)
            response.set_cookie('jwt_token', access_token, httponly=True, secure=True, max_age=timedelta(hours=720).total_seconds())  # Set cookie with token

            return response

        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Run the app with a background process for cloth identification
if __name__ == '__main__':
    # predicted_class = process_uploaded_picture("sample.jpg")
    # print(predicted_class)
    with app.app_context():
        db.create_all()
    # cloth_process = multiprocessing.Process(target=cloth_identification_routine, args=(filename,))
    # cloth_process.start()
    app.run("0.0.0.0",port=5001,debug=True)
