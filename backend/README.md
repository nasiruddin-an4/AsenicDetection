# Plant Arenicosis Detection Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database
1. Install PostgreSQL on your system
2. Create a database user and database:
```sql
-- Run these commands in psql as superuser
CREATE DATABASE plant_detection;
CREATE USER plant_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE plant_detection TO plant_user;
```

3. Run the database setup script:
```bash
psql -U postgres -d plant_detection -f database_setup.sql
```

### 3. Update Database Configuration
Edit the `DB_CONFIG` in `app.py` with your PostgreSQL credentials:
```python
DB_CONFIG = {
    "host": "localhost",
    "database": "plant_detection",
    "user": "your_username",
    "password": "your_password",
    "port": 5432
}
```

### 4. Add Your ML Model
1. Place your trained model file (`mobilenetv2.h5` or `efficientnetb0.h5`) in the `models/` directory
2. Update the `MODEL_PATH` in `app.py` if using a different model name

### 5. Run the Backend
```bash
python app.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /predict` - Upload image for prediction
- `GET /predictions` - Get all prediction history
- `DELETE /predictions/{id}` - Delete specific prediction
- `GET /` - Health check

## Model Requirements

Your ML model should:
- Accept 224x224 RGB images
- Output a single probability value (0-1)
- Values > 0.5 indicate "infected"
- Values ≤ 0.5 indicate "not infected"

## File Structure
```
backend/
├── app.py              # Main FastAPI application
├── requirements.txt    # Python dependencies
├── database_setup.sql  # Database schema
├── models/            # Place your .h5 model files here
└── uploads/           # Uploaded images storage
```