// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header
      style={{
        backgroundColor: '#C41E3A',
        color: '#fff',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px'
      }}
    >
      <h1>
        <Link to="/" style={{ color: '#fff',textDecoration: 'none' }}>
          BadgerMate
        </Link>
      </h1>
      <nav style={{ marginTop: '10px' }}>
        <Link
          to="/about"
          style={{
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #fff',
            borderRadius: '4px'
          }}
        >
          About Us
        </Link>
      </nav>
    </header>
  );
};

export default Header;