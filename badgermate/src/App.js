// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Survey from './components/Survey';
import Matches from './components/Matches';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserProvider } from './components/UserContext'; // Adjust the path if necessary

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
