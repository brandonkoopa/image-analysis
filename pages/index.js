import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useTheme } from './ThemeProvider';

export default function Home() {
  const theme = useTheme();  // Theme settings for styling
  const [images, setImages] = useState([]);  // Image data
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error message
  const [file, setFile] = useState(null);  // Selected file
  const [fileName, setFileName] = useState("No image chosen");  // File name
  const [label, setLabel] = useState('');  // Image label (optional)
  const [isUploading, setIsUploading] = useState(false);  // Upload state
  const [dialogImage, setDialogImage] = useState(null);  // Image for dialog
  const [searchTerm, setSearchTerm] = useState('');  // Search term

  const searchTimeout = useRef(null);  // Timeout for debounce

  // Fetch images from the API
  const fetchImages = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/images?objects=${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchImages(value);
    }, 500);  // Debounce delay
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const chosenFile = event.target.files[0];
    setFile(chosenFile);
    setFileName(chosenFile ? chosenFile.name : "No image chosen");
  };

  // Submit the selected file
  const submitFile = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);
    if (label) formData.append('label', label);

    try {
      const response = await fetch('http://localhost:4000/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const result = await response.json();
      setImages([...images, result]);
      setFile(null);
      setFileName('No image chosen');
      setLabel('');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Show the image dialog
  const openDialog = (imageSrc) => {
    setDialogImage(imageSrc);
    const dialog = document.getElementById('imageDialog');
    dialog.showModal();
  };

  // Hide the image dialog
  const closeDialog = () => {
    const dialog = document.getElementById('imageDialog');
    dialog.close();
  };

  return (
    <div className="home">
      <Head>
        <title>Image Object Detection</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Image Object Detection</h1>
        <p>Select an image, submit, and detect objects.</p>

        {/* Upload Form */}
        <div className="form-box">
          <div className="form">
            <label htmlFor="fileInput" className="custom-file-upload">
              Choose Image
            </label>
            <span className="file-name">{fileName}</span>
            <input
              type="file"
              id="fileInput"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-label="Choose image"
            />
            <input
              type="text"
              id="labelInput"
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              aria-label="Label (optional)"
            />
            <button disabled={!file} onClick={submitFile} style={{ opacity: file ? 1 : 0.5 }}>
              Submit
            </button>
          </div>
        </div>

        {/* Search Input */}
        <input 
          type="text" 
          placeholder="Search by detected objects"
          value={searchTerm} 
          onChange={handleSearchChange} 
          className="search-input"
        />

        {/* Loading Indicator */}
        {loading && <p>Loading images...</p>}

        {/* Error Display */}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {/* Image List */}
        <div className="image-list">
          {images.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Label</th>
                  <th>Detected Objects</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image) => (
                  <tr key={image.id}>
                    <td>
                      <img 
                        src={`http://localhost:4000/uploads/${image.file.filename}`} 
                        alt={image.label} 
                        className="image-preview" 
                        onClick={() => openDialog(`http://localhost:4000/uploads/${image.file.filename}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>{image.label}</td>
                    <td>{Array.isArray(image.objects) ? image.objects.join(', ') : 'No objects detected'}</td>
                  </tr>
                ))}
                {isUploading && (
                  <tr className="glow">
                    <td colSpan="3">Uploading new image...</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            !loading && <p>No images found</p>
          )}
        </div>

        {/* Image Dialog */}
        <dialog id="imageDialog" className="dialog">
          <img src={dialogImage} alt="Large preview" className="dialog-image" />
          <button onClick={closeDialog} className="close-button">Close</button>
        </dialog>
      </main>

      <style jsx global>{`
        .home {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: ${theme.fonts.body};
          font-size: ${theme.fontSizes.body};
          color: ${theme.colors.text};
        }
        h1 {
          font-size: ${theme.fontSizes.heading};
          color: ${theme.colors.primary};
          font-family: ${theme.fonts.heading};
          text-align: center;
        }
        p {
          font-size: ${theme.fontSizes.body};
          text-align: center;
          color: ${theme.colors.textSecondary};
        }
        .search-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-size: 16px;
        }
        .form-box {
          border: 2px solid ${theme.colors.primary};
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        .form {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .custom-file-upload {
          background-color: ${theme.colors.primary};
          color: #fff;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-right: 10px;
          display: block;
          margin-bottom: 10px;
        }
        .file-name {
          margin-bottom: 10px;
          font-size: 16px;
          color: ${theme.colors.textSecondary};
        }
        input[type="text"] {
          margin: 0 10px 10px;
          padding: 8px;
          width: 90%;
          max-width: 400px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          background-color: ${theme.colors.primary};
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: ${theme.colors.primaryHover};
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: center;
        }
        th {
          background-color: ${theme.colors.table.backgroundColor};
          color: white;
        }
        img {
          border: 1px solid #ccc;
          border-radius: 4px;
          max-width: 100%;
          cursor: pointer;
        }
        .image-preview {
          max-width: 150px;
          height: auto;
        }
        .glow {
          animation: glowing 1.5s infinite;
          background-color: #f8f8f8;
        }
        @keyframes glowing {
          0% { background-color: #fff; }
          50% { background-color: #f0f0f0; }
          100% { background-color: #fff; }
        }
        dialog {
          border: none;
          border-radius: 8px;
          padding: 56px;
          max-width: 90%;
          background: #fff;
        }
        .dialog-image {
          max-width: 100%;
          height: auto;
        }
        .close-button {
          background-color: ${theme.colors.primary};
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
          top: 0px;
          right: 10px;
          position: absolute;
        }
        .close-button:hover {
          background-color: ${theme.colors.primaryHover};
        }
      `}</style>
    </div>
  );
}