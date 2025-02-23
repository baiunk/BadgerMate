// src/pages/Matches.js
import './custom.css'
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Matches = () => {
  // Access the state passed from the previous page
  const location = useLocation();
  const { matches } = location.state || {};
  const defaultImageUrl = '/default.png';

  if (!matches || matches.length === 0) {
    return <div>No match data available.</div>;
  }

  return (
    <div>
      {console.log(matches)}
      <h2 className="mb-4 text-center">Roommate Matches</h2>
      <div className="row">
        <div className="col">
          <div className="d-flex flex-wrap justify-content-center">
            {matches.map((match, index) => {
              const imageSrc = match.profilePicture || defaultImageUrl;
              if (index === 0) {
                return (
                  <div className = "col-12">
                    <div key={match.id} className="card mb-4 border-dark mx-auto" style={{ width: '40rem' }}>
                      <div className="card-body">
                        <div className="card-body text-center">
                          <img
                            src={imageSrc}
                            alt={`${match.FName} ${match.LName}`}
                            style={{
                              width: '150px',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '0%',
                              marginBottom: '1rem'
                            }}
                            />
                          </div>
                        <h3 className="card-title">
                          {match.FName}  {match.LName} (Top Match)
                        </h3>
                        <p className="card-text">
                          <strong>Match Score:</strong> {Math.round(match.score)}
                        </p>
                        <p className="card-text">
                          {match.Major}
                        </p>
                        <p className="card-text">
                          {match.Email}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={match.id} className="card mb-2 m-4" style={{ width: '40rem' }}>
                    <div className="card-body">
                    <div className="card-body text-center">
                          <img
                            src={imageSrc}
                            alt={`${match.FName} ${match.LName}`}
                            style={{
                              width: '150px',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '0%',
                              marginBottom: '1rem'
                            }}
                            />
                          </div>
                      <h5 className="card-title">
                        {match.FName} {match.LName}
                      </h5>
                      <p className="card-text">
                        <strong>Match Score:</strong> {Math.round(match.score)}
                      </p>
                      <p className="card-text">
                        {match.Major} 
                      </p>
                      <p className="card-text">
                        {match.Email} 
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