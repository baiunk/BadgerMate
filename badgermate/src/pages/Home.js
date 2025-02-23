import './custom.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Ensure this path is correct

const Home = () => {
  const navigate = useNavigate();
  const { setUserId } = useUser();
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [major, setMajor] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  // Profile picture states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const defaultImageUrl = '/images/default-profile.png'; // Ensure this image exists in your public folder

  // Helper: Convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that email ends with @wisc.edu
    if (!email.trim().toLowerCase().endsWith('@wisc.edu')) {
      setError("Email must end with @wisc.edu");
      return;
    }
    
    // Clear any error messages
    setError('');

    // Prepare user data
    const userData = {
      FName: firstName,
      LName: lastName,
      Major: major,
      Age: parseInt(age),
      Email: email,
    };

    // If a profile picture file is selected, convert it to base64 and add to the userData;
    // otherwise, add the default image URL.
    if (selectedFile) {
      try {
        const base64Image = await getBase64(selectedFile);
        userData.profilePicture = base64Image;
      } catch (err) {
        console.error("Error converting file:", err);
        setError("Error processing the profile picture");
        return;
      }
    } else {
      userData.profilePicture = defaultImageUrl;
    }

    try {
      console.log(userData);
      // Send data to the backend (using the same API endpoint)
      const response = await fetch('http://localhost:5000/api/new_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred");
        return;
      }

      // Get the user ID from the response
      const responseData = await response.json();
      const userId = responseData.user_id; // Extract the user ID

      // Set the user ID in context
      setUserId(userId);

      // Navigate to the survey page with the user ID
      navigate('/survey', { state: { userId } });
    } catch (error) {
      setError("Failed to connect to the server");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Welcome to BadgerMate</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input 
            type="text" 
            className="form-control" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input 
            type="text" 
            className="form-control" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Major</label>
          <input 
            type="text" 
            className="form-control" 
            value={major} 
            onChange={(e) => setMajor(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Age</label>
          <input 
            type="number" 
            className="form-control" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email (must end with @wisc.edu)</label>
          <input 
            type="email" 
            className="form-control" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          {error && <div className="text-danger mt-2">{error}</div>}
        </div>
        
        {/* Profile Picture Section */}
        <div className="mb-3">
          <h3>Profile Picture</h3>
          <img
            src={previewUrl || defaultImageUrl}
            alt="Profile Preview"
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'cover',
              borderRadius: '0%',
              display: 'block',
              marginBottom: '1rem'
            }}
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Continue</button>
      </form>
    </div>
  );
};

export default Home;
