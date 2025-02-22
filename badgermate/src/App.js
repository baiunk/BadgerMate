// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './pages/Header';
import Home from './pages/Home';
import Survey from './pages/Survey';
import Matches from './pages/Matches';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserProvider } from './pages/UserContext'; // Adjust the path if necessary

function App() {
  return (
    <UserProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/matches" element={<Matches />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
