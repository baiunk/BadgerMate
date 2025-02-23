// src/pages/Matches.js
import './custom.css'
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Matches = () => {
  // Access the state passed from the previous page
  const location = useLocation();
  const { matches } = location.state || {};

  if (!matches || matches.length === 0) {
    return <div>No match data available.</div>;
  }

  return (
    <div>
      <h2 className="mb-4 text-center">Roommate Matches</h2>
      <div className="row">
        <div className="col-md-3">
          {/* Future filters/navigation can be added here */}
        </div>
        <div className="col-md-9">
          <div className="d-flex flex-wrap justify-content-center">
            {matches.map((match, index) => {
              if (index === 0) {
                return (
                  <div key={match.id} className="card mb-4 border-dark m-2" style={{ width: '40rem' }}>
                    <div className="card-body">
                      <h3 className="card-title">
                        {match.FName}  {match.LName} (Top Match)
                      </h3>
                      <p className="card-text">
                        <strong>Match Score:</strong> {Math.round(match.score)}
                      </p>
                      <p className="card-text">
                        {match.Major} | {match.Email}
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={match.id} className="card mb-1 m-14" style={{ width: '40rem' }}>
                    <div className="card-body">
                      <h5 className="card-title">
                        {match.FName} {match.LName}
                      </h5>
                      <p className="card-text">
                        <strong>Match Score:</strong> {Math.round(match.score)}
                      </p>
                      <p className="card-text">
                        {match.Major} | {match.Email}
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
      <Link to="/" className="btn btn-secondary mt-3">
        Back to Survey
      </Link>
    </div>
  );
}
  

export default Matches;