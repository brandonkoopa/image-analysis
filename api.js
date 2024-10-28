import express from 'express';
import cors from 'cors';
import multer from 'multer';
import vision from '@google-cloud/vision';
import 'dotenv/config';
import { openDb, initDb, insertImage, getAllImages, getImagesByObjects } from './db.js';

// Configure Multer for handling image file uploads, storing them in the 'uploads/' directory
const upload = multer({ dest: 'uploads/' });

// Initialize the Google Vision API client for object detection
const client = new vision.ImageAnnotatorClient();

// Create the Express app instance
const app = express();
const port = 4000;

// Main function to initialize the server
const initializeServer = async () => {
  // Set up the database and server configuration
  await initDb(); // Initialize the SQLite database if not already set up
  configureMiddleware(app); // Configure Express middleware
  configureRoutes(app); // Set up API routes
  startServer(app, port); // Start listening for incoming requests
};

// Configure middleware for the Express app
const configureMiddleware = (app) => {
  app.use(cors({ origin: 'http://localhost:4001' })); // Allow CORS from the specified origin
  app.use(express.json()); // Parse incoming JSON requests
  app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' directory
};

// Define the routes for the Express app
const configureRoutes = (app) => {
  app.post('/images', upload.single('image'), handleUpload); // Route for uploading an image
  app.get('/images', handleGetImages); // Route for retrieving all images (with optional filtering)
  app.get('/images/:imageId', handleGetImageById); // Route for retrieving a specific image by ID
};

// Start the Express server
const startServer = (app, port) => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

// Detect objects in an image using the Google Vision API
const detectObjects = async (imagePath) =>
  client.objectLocalization(imagePath)
    .then(([result]) => result.localizedObjectAnnotations.map(object => object.name)) // Extract object names
    .catch(error => {
      console.error('Error detecting objects:', error);
      throw error; // Propagate the error to be handled by the caller
    });

// Create metadata object for the uploaded file
const createFileMetadata = (file) => ({
  fieldname: file.fieldname,
  originalname: file.originalname,
  encoding: file.encoding,
  mimetype: file.mimetype,
  destination: file.destination,
  filename: file.filename,
  path: file.path,
  size: file.size
});

// Handle image upload, run object detection, and save metadata
const handleUpload = async (req, res) => {
  const { file, body: { label } } = req;

  // Check if an image file was uploaded
  if (!file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    // Perform object detection on the uploaded image
    const detectedObjects = await detectObjects(file.path);
    // Create file metadata
    const fileMetadata = createFileMetadata(file);
    // Save the image metadata in the database
    const imageRecord = await saveImageRecord('Image uploaded successfully', label, detectedObjects, fileMetadata);

    // Return the saved image metadata in the response
    res.status(200).json(imageRecord);
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Save an image record in the database and return the saved record
const saveImageRecord = async (message, label, detectedObjects, fileMetadata) => {
  const db = await openDb();
  const result = await db.run(`
    INSERT INTO images (message, label, objects, file)
    VALUES (?, ?, ?, ?)
  `, [
    message,
    label || 'No label provided', // Default label if none provided
    JSON.stringify(detectedObjects), // Store objects as a JSON string
    JSON.stringify(fileMetadata) // Store file metadata as a JSON string
  ]);

  // Return the saved image record with the newly assigned ID
  return {
    id: result.lastID,
    message,
    label: label || 'No label provided',
    objects: detectedObjects,
    file: fileMetadata
  };
};

// Handle request to get all images, with optional object filtering via query parameter
const handleGetImages = async (req, res) => {
  const { objects } = req.query;

  try {
    const images = objects
      ? await getImagesByObjects(objects.split(',').map(obj => obj.trim().toLowerCase())) // Filter images by objects
      : await getAllImages(); // Get all images if no filter is provided

    res.status(200).json(images);
  } catch (err) {
    console.error('Error retrieving images:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle request to get a specific image by its ID
const handleGetImageById = async (req, res) => {
  const { imageId } = req.params;

  try {
    const db = await openDb();
    const image = await db.get('SELECT * FROM images WHERE id = ?', [imageId]);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Parse JSON fields back into objects for the response
    res.status(200).json({
      ...image,
      objects: JSON.parse(image.objects),
      file: JSON.parse(image.file)
    });
  } catch (err) {
    console.error('Error retrieving image:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Initialize the server and start it
initializeServer().catch((err) => {
  console.error('Failed to initialize server:', err);
});