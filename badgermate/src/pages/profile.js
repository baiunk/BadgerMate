// src/components/ProfilePictureUpdate.js
import React, { useState } from 'react';

const ProfilePictureUpdate = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Update this URL to point to your default profile image.
  const defaultImageUrl = '../assets/default.jpg';

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      console.log("No file selected, using default profile picture.");
      // Here you could also send a request to explicitly use the default image.
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);
    // Append any other required data such as userId if necessary.

    fetch('http://localhost:5000/api/update_profile_picture', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => console.log("Profile picture updated:", data))
      .catch((error) => console.error("Error updating profile picture:", error));
  };

  return (
    <div className="profile-picture-update mt-5">
      <h3>Update Profile Picture</h3>
      <form onSubmit={handleSubmit}>
        <img
          src={previewUrl || defaultImageUrl}
          alt="Profile Preview"
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block',
            marginBottom: '1rem'
          }}
        />
        <div className="mb-3">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Picture
        </button>
      </form>
    </div>
  );
};

export default ProfilePictureUpdate;
