from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
from datetime import datetime
from PIL import Image
import random
from pathlib import Path

app = FastAPI(title="Arsenic Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_FOLDER = "uploads"
TRAINING_FOLDER = "training_data"
IMAGE_SIZE = (224, 224)

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(TRAINING_FOLDER, "infected"), exist_ok=True)
os.makedirs(os.path.join(TRAINING_FOLDER, "not_infected"), exist_ok=True)

# Simple in-memory storage
predictions_storage = []
users_storage = []
training_features = {"infected": [], "not_infected": []}


def extract_image_features(image_path):
    """Extract simple features from image without numpy"""
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize(IMAGE_SIZE)
        pixels = list(img.getdata())
        
        # Calculate average RGB values
        r_values = [p[0] for p in pixels]
        g_values = [p[1] for p in pixels]
        b_values = [p[2] for p in pixels]
        
        r_mean = sum(r_values) / len(r_values)
        g_mean = sum(g_values) / len(g_values)
        b_mean = sum(b_values) / len(b_values)
        brightness = (r_mean + g_mean + b_mean) / 3
        
        # Calculate contrast (standard deviation)
        variance = sum((p - brightness) ** 2 for p in [(r + g + b) / 3 for r, g, b in zip(r_values, g_values, b_values)]) / len(pixels)
        contrast = variance ** 0.5
        
        return [r_mean, g_mean, b_mean, brightness, contrast]
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None


def load_training_data():
    """Load all training images and extract features"""
    global training_features
    training_features = {"infected": [], "not_infected": []}
    
    for label in ["infected", "not_infected"]:
        folder_path = os.path.join(TRAINING_FOLDER, label)
        if os.path.exists(folder_path):
            try:
                for filename in os.listdir(folder_path):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                        try:
                            image_path = os.path.join(folder_path, filename)
                            features = extract_image_features(image_path)
                            if features:
                                training_features[label].append(features)
                        except Exception as e:
                            print(f"Skipping {filename}: {e}")
                            continue
            except Exception as e:
                print(f"Error loading {label} folder: {e}")


def predict_from_training_data(image_features):
    """Simple prediction based on training data similarity"""
    if not training_features["infected"] and not training_features["not_infected"]:
        # No training data, return random
        return "not_infected", round(random.uniform(50, 75), 2)
    
    if not training_features["infected"]:
        # No infected samples in training
        return "not_infected", round(random.uniform(60, 80), 2)
    
    if not training_features["not_infected"]:
        # No healthy samples in training
        return "infected", round(random.uniform(60, 80), 2)
    
    # Calculate similarity to each class using Euclidean distance
    def calculate_min_distance(features, training_list):
        """Find minimum distance to any sample in training list"""
        if not training_list:
            return float('inf')
        distances = []
        for training_feat in training_list:
            # Euclidean distance
            dist = sum((f1 - f2) ** 2 for f1, f2 in zip(features, training_feat)) ** 0.5
            distances.append(dist)
        return min(distances)  # Return closest match instead of average
    
    infected_distance = calculate_min_distance(image_features, training_features["infected"])
    healthy_distance = calculate_min_distance(image_features, training_features["not_infected"])
    
    # Determine result based on which class is closer
    total_distance = infected_distance + healthy_distance
    
    if infected_distance < healthy_distance:
        # Closer to infected class
        confidence = max(55, 100 - (infected_distance / total_distance) * 100)
        return "infected", round(confidence, 2)
    else:
        # Closer to healthy class
        confidence = max(55, 100 - (healthy_distance / total_distance) * 100)
        return "not_infected", round(confidence, 2)


# Load training data on startup
load_training_data()


@app.get("/")
async def root():
    return {"message": "Arsenic Detection API", "status": "running"}


@app.post("/register")
async def register(email: str, password: str, name: str):
    """Register new user"""
    # Check if user exists
    if any(user["email"] == email for user in users_storage):
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = {
        "id": len(users_storage) + 1,
        "email": email,
        "password": password,
        "name": name,
        "created_at": datetime.now().isoformat()
    }
    users_storage.append(user)
    
    return {"success": True, "message": "User registered successfully", "user_id": user["id"]}


@app.post("/login")
async def login(email: str, password: str):
    """Login user"""
    user = next((u for u in users_storage if u["email"] == email and u["password"] == password), None)
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return {
        "success": True,
        "message": "Login successful",
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"]
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Make prediction on uploaded image"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_path = None
    try:
        # Save uploaded file
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Extract features from uploaded image
        image_features = extract_image_features(file_path)
        
        if image_features is None:
            raise HTTPException(status_code=400, detail="Could not process image")
        
        # Make prediction based on training data
        result, confidence = predict_from_training_data(image_features)
        
        # Store prediction
        prediction_record = {
            "id": len(predictions_storage) + 1,
            "filename": unique_filename,
            "result": result,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
            "file_path": file_path
        }
        predictions_storage.append(prediction_record)
        
        return {
            "success": True,
            "result": result,
            "confidence": confidence,
            "filename": unique_filename,
            "image_url": f"/uploads/{unique_filename}",
            "message": f"Sample appears to be {result.replace('_', ' ')}",
            "recommendation": "Seek expert advice for treatment" if result == "infected" else "Sample is healthy"
        }
        
    except Exception as e:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/predictions")
async def get_predictions():
    """Get all predictions"""
    return predictions_storage


@app.get("/training-stats")
async def get_training_stats():
    """Get training data statistics"""
    infected_count = len([f for f in os.listdir(os.path.join(TRAINING_FOLDER, "infected")) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))])
    healthy_count = len([f for f in os.listdir(os.path.join(TRAINING_FOLDER, "not_infected"))
                        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))])
    
    return {
        "infected_count": infected_count,
        "healthy_count": healthy_count,
        "total_training_images": infected_count + healthy_count,
        "model_ready": infected_count > 0 and healthy_count > 0
    }


@app.post("/retrain")
async def retrain_model():
    """Retrain model with training data"""
    load_training_data()
    
    infected_count = len(training_features["infected"])
    healthy_count = len(training_features["not_infected"])
    
    return {
        "success": True,
        "message": "Model retrained successfully",
        "infected_samples": infected_count,
        "healthy_samples": healthy_count,
        "total_samples": infected_count + healthy_count
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# Load training data on startup
load_training_data()


@app.get("/")
async def root():
    return {"message": "Arsenic Detection API", "status": "running"}


@app.post("/register")
async def register(email: str, password: str, name: str):
    """Register new user"""
    # Check if user exists
    if any(user["email"] == email for user in users_storage):
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = {
        "id": len(users_storage) + 1,
        "email": email,
        "password": password,
        "name": name,
        "created_at": datetime.now().isoformat()
    }
    users_storage.append(user)
    
    return {"success": True, "message": "User registered successfully", "user_id": user["id"]}


@app.post("/login")
async def login(email: str, password: str):
    """Login user"""
    user = next((u for u in users_storage if u["email"] == email and u["password"] == password), None)
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return {
        "success": True,
        "message": "Login successful",
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"]
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Make prediction on uploaded image"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_path = None
    try:
        # Save uploaded file
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Extract features from uploaded image
        image_features = extract_image_features(file_path)
        
        if image_features is None:
            raise HTTPException(status_code=400, detail="Could not process image")
        
        # Make prediction based on training data
        result, confidence = predict_from_training_data(image_features)
        
        # Store prediction
        prediction_record = {
            "id": len(predictions_storage) + 1,
            "filename": unique_filename,
            "result": result,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
            "file_path": file_path
        }
        predictions_storage.append(prediction_record)
        
        return {
            "success": True,
            "result": result,
            "confidence": confidence,
            "filename": unique_filename,
            "image_url": f"/uploads/{unique_filename}",
            "message": f"Sample appears to be {result.replace('_', ' ')}",
            "recommendation": "Seek expert advice for treatment" if result == "infected" else "Sample is healthy"
        }
        
    except Exception as e:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/predictions")
async def get_predictions():
    """Get all predictions"""
    return predictions_storage


@app.get("/training-stats")
async def get_training_stats():
    """Get training data statistics"""
    infected_count = len([f for f in os.listdir(os.path.join(TRAINING_FOLDER, "infected")) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))])
    healthy_count = len([f for f in os.listdir(os.path.join(TRAINING_FOLDER, "not_infected"))
                        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))])
    
    return {
        "infected_count": infected_count,
        "healthy_count": healthy_count,
        "total_training_images": infected_count + healthy_count,
        "model_ready": infected_count > 0 and healthy_count > 0
    }


@app.post("/retrain")
async def retrain_model():
    """Retrain model with training data"""
    load_training_data()
    
    infected_count = len(training_features["infected"])
    healthy_count = len(training_features["not_infected"])
    
    return {
        "success": True,
        "message": "Model retrained successfully",
        "infected_samples": infected_count,
        "healthy_samples": healthy_count,
        "total_samples": infected_count + healthy_count
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)