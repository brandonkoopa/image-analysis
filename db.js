import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open connection to the SQLite database
// Returns database connection object for performing queries
export async function openDb() {
  return open({
    filename: './image-analysis.db',
    driver: sqlite3.Database,  // This uses the sqlite3 driver
  });
}

// Initialize database by creating 'images' table if it does not exist
export async function initDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      label TEXT,
      objects TEXT,
      file JSON
    );
  `);
}

// Insert new image record into database
export async function insertImage(message, label, objects, file) {
  const db = await openDb();
  return db.run(`
    INSERT INTO images (message, label, objects, file)
    VALUES (?, ?, ?, ?)
  `, [
    message,
    label,
    JSON.stringify(objects),
    JSON.stringify(file)
  ]);
}

// Retrieve all images from the database
export async function getAllImages() {
  const db = await openDb();
  const images = await db.all('SELECT * FROM images');

  // Parse the 'objects' and 'file' JSON fields back into js objects
  return images.map(image => ({
    ...image,
    objects: JSON.parse(image.objects),
    file: JSON.parse(image.file),
  }))
}

// Retrieve images that contain any of the given objects
export async function getImagesByObjects(searchObjects) {
  const db = await openDb();
  const images = await db.all('SELECT * FROM images');

  // Filter images that contain any of the search objects
  return images
  .map(image => ({
    ...image,
    objects: JSON.parse(image.objects),
    file: JSON.parse(image.file),
  }))
  .filter(image => {
    const imageObjects = image.objects.map(obj => obj.toLowerCase());
    return searchObjects.some(obj => imageObjects.includes(obj));
  });
}
