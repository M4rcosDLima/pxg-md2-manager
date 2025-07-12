# backend/db.py
import pyrebase

config = {
    "apiKey": "SUA_API_KEY",
    "authDomain": "SUA_AUTH_DOMAIN",
    "databaseURL": "https://health-haven-12482-default-rtdb.firebaseio.com/",  # ✅ aqui!
    "projectId": "SUA_PROJECT_ID",
    "storageBucket": "SUA_STORAGE_BUCKET",
    "messagingSenderId": "SEU_SENDER_ID",
    "appId": "SEU_APP_ID"
}

firebase = pyrebase.initialize_app(config)
firebase_db = firebase.database()
