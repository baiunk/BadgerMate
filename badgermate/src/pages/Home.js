import './custom.css'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Ensure this path is correct

const Home = () => {
  const navigate = useNavigate();
  const { setUserId } = useUser(); // Call useUser at the top level
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [major, setMajor] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

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

    try {
      console.log(userData);
      // Send data to the backend
      const response = await fetch('https://badgermate.onrender.com/api/new_user', {
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
        <button type="submit" className="btn btn-primary">Continue</button>
      </form>
    </div>
  );
};

export default Home;
