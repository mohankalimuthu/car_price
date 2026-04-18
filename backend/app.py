from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta


app = Flask(__name__)
CORS(app)
load_dotenv()

MONGO_URL = os.getenv("Mongo_URI")
EMAIL = os.getenv("mail")
EMAIL_PASS = os.getenv("mail_sender")

client = MongoClient(MONGO_URL)
db = client['Nexto']
collection = db['User_Credentials']
otp_store = {}

@app.route("/register", methods=["POST"])
def register():
    data = request.json   # 👈 data from JS

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    print(name,email,password)

    # Check user exists
    if collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"})

    collection.insert_one({
        "name": name,
        "email": email,
        "password": password
    })

    return jsonify({"message": "User registered successfully"})


# Login API
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = collection.find_one({"email": email})

    if not user:
        return jsonify({"message": "User not found"})

    if user["password"] != password:
        return jsonify({"message": "Invalid password"})

    return jsonify({"message": "Login successful"})


@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    email = data.get("email")

    user = collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"})

    otp = str(random.randint(100000, 999999))

    # store OTP with expiry
    otp_store[email] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=5)
    }

    # 📧 Send email (Gmail example)
    sender = os.getenv("EMAIL")
    password = os.getenv("EMAIL_PASS")

    msg = MIMEText(f"Your OTP is {otp}")
    msg["Subject"] = "Password Reset OTP"
    msg["From"] = sender
    msg["To"] = email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, email, msg.as_string())
        server.quit()
    except Exception as e:
        print(e)
        return jsonify({"message": "Failed to send email"})

    return jsonify({"message": "OTP sent to email"})

@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    record = otp_store.get(email)

    if not record:
        return jsonify({"message": "OTP not found"})

    if datetime.utcnow() > record["expires"]:
        return jsonify({"message": "OTP expired"})

    if record["otp"] != otp:
        return jsonify({"message": "Invalid OTP"})

    # update password
    collection.update_one(
        {"email": email},
        {"$set": {"password": new_password}}
    )

    del otp_store[email]

    return jsonify({"message": "Password reset successful"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))


