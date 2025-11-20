import gdown
import zipfile

# Google Drive shared link (make sure it's a "shareable link" ending with /view)
DRIVE_LINK = "https://drive.google.com/uc?id=1RsKvPydEHZR8ENBOolbTr5TXop-CEft9"
TRAINING_ZIP = "training_data.zip"
TRAINING_FOLDER = "training_data"

# Download training data if not exists
if not os.path.exists(TRAINING_FOLDER):
    print("Downloading training data from Google Drive...")
    gdown.download(DRIVE_LINK, TRAINING_ZIP, quiet=False)

    # Unzip
    with zipfile.ZipFile(TRAINING_ZIP, "r") as zip_ref:
        zip_ref.extractall(TRAINING_FOLDER)
    os.remove(TRAINING_ZIP)
    print("Training data ready.")
else:
    print("Training data folder exists, skipping download.")
