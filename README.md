# Image Analysis API

This project provides a REST API for uploading images, performing object detection, and returning the associated metadata. The goal is to allow users to upload an image, optionally detect objects in the image, and retrieve metadata for all stored images, with the ability to filter based on detected objects. The API is implemented in **JavaScript**, chosen for its rapid development capabilities and ease of integration with existing libraries and services. The code follows **functional programming** principles where possible, emphasizing immutability, pure functions, and declarative data handling.

## Features

- **REST API**: Implements an HTTP API to upload images, detect objects, and retrieve image metadata.
- **Functional Programming**: Follows functional programming practices such as immutability, higher-order functions, and declarative code.
- **Object Detection**: Uses the Google Cloud Vision API to detect objects in images.
- **SQLite Database**: Stores metadata for uploaded images, including any detected objects.
- **Error Handling**: Uses appropriate HTTP status codes for client and server errors.

## Getting Started

### Prerequisites

- **Node.js** version `18.17.0` or higher is required.

### Step 1: Install Node.js Using `nvm` (Node Version Manager)

1. **Install `nvm`**:

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    ```

2. **Load `nvm`**:

    ```bash
    source ~/.nvm/nvm.sh
    ```

3. **Install and use Node.js version `18.17.0`**:

    ```bash
    nvm install 18.17.0
    nvm use 18.17.0
    ```

4. **Verify Node.js is installed**:

    ```bash
    node -v  # Should output v18.17.0 or higher
    ```

### Step 2: Set Up the Project

1. **Clone the repository**:

    ```bash
    git clone https://github.com/brandonkoopa/image-analysis.git
    cd image-analysis
    ```

2. **Set up Google Cloud Vision API credentials**:

   - Obtain the `vision-key.json` file and place it in the `config/` folder:

     ```
     /path/to/project/config/vision-key.json
     ```

   - Create a `.env` file in the project root and add:

     ```bash
     GOOGLE_APPLICATION_CREDENTIALS=./config/vision-key.json
     ```

3. **Install dependencies**:

    ```bash
    npm install
    ```

4. **Run the API & UI**:

    ```bash
    npm run dev
    ```

    - **API** runs at [http://localhost:4000](http://localhost:4000)
    - **UI** runs at [http://localhost:4001/](http://localhost:4001/)

## API Specification

### 1. `GET /images`
   - Returns HTTP `200` OK with a JSON response containing all image metadata.
   - Example response:
     ```json
     [
       {
         "id": 1,
         "message": "Image uploaded successfully",
         "label": "Sample Label",
         "objects": ["Dog", "Car"],
         "file": {
           "originalname": "sample.jpg",
           "path": "uploads/sample.jpg",
           "size": 123456
         }
       }
     ]
     ```

### 2. `GET /images?objects=dog,cat`
   - Returns HTTP `200` OK with a JSON response containing only the images that match the specified detected objects.
   - Example response:
     ```json
     [
       {
         "id": 1,
         "message": "Image uploaded successfully",
         "label": "Sample Label",
         "objects": ["Dog", "Cat"],
         "file": {
           "originalname": "sample.jpg",
           "path": "uploads/sample.jpg",
           "size": 123456
         }
       }
     ]
     ```

### 3. `GET /images/{imageId}`
   - Returns HTTP `200` OK with a JSON response containing image metadata for the specified image.
   - Example response:
     ```json
     {
       "id": 1,
       "message": "Image uploaded successfully",
       "label": "Sample Label",
       "objects": ["Dog", "Car"],
       "file": {
         "originalname": "sample.jpg",
         "path": "uploads/sample.jpg",
         "size": 123456
       }
     }
     ```

### 4. `POST /images`
   - Accepts a multipart/form-data request with an image file, an optional label, and an optional flag to enable object detection.
   - Returns HTTP `200` OK with a JSON response including the image data, label, identifier, and any detected objects.
   - Example request body:
     ```
     FormData {
       image: <binary file>,
       label: "My Image",
       detectObjects: "true"
     }
     ```
   - Example response:
     ```json
     {
       "id": 1,
       "message": "Image uploaded successfully",
       "label": "My Image",
       "objects": ["Dog", "Car"],
       "file": {
         "originalname": "my_image.jpg",
         "path": "uploads/my_image.jpg",
         "size": 123456
       }
     }
     ```

## Object Detection Instructions

Object detection is performed using the Google Cloud Vision API, which returns a list of detected object names within the uploaded image. To use this feature, ensure the Google Cloud Vision API credentials are set up correctly.

## Database

The project uses an SQLite database to store image metadata, including the label, detected objects, and file information.