import './custom.css'
import React from 'react';
import { Link } from 'react-router-dom';

const Matches = () => {
  // Dummy data for matching roommates.
  const dummyMatches = [
    {
      id: 1,
      name: 'Alice',
      gender: 'Female',
      cleanliness: 'Very Clean',
      smoke: 'No',
      pets: 'No',
      quietPreference: 'Yes',
      matchScore: 95,
      bio: 'I love a clean space and quiet evenings. Enjoy cooking and reading.',
    },
    {
      id: 2,
      name: 'Bob',
      gender: 'Male',
      cleanliness: 'Clean',
      smoke: 'No',
      pets: 'Yes',
      quietPreference: 'No',
      matchScore: 88,
      bio: 'Outgoing and friendly. Prefers a balanced lifestyle and occasional parties.',
    },
    {
      id: 3,
      name: 'Charlie',
      gender: 'Other',
      cleanliness: 'Average',
      smoke: 'No',
      pets: 'No',
      quietPreference: 'Yes',
      matchScore: 80,
      bio: 'Relaxed and easygoing. Enjoys quiet nights and creative pursuits.',
    },
  ];

  return (
    <div>
      <h2 className="mb-4">Roommate Matches</h2>
      <div className="row">
        <div className="col-md-3">
          {/* Future filters/navigation can be added here */}
        </div>
        <div className="col-md-9">
          {dummyMatches.map((match, index) => {
            if (index === 0) {
              return (
                <div key={match.id} className="card mb-4 border-dark">
                  <div className="card-body">
                    <h3 className="card-title">{match.name} (Top Match)</h3>
                    <p className="card-text"><strong>Match Score:</strong> {match.matchScore}</p>
                    <p className="card-text">{match.bio}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={match.id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">{match.name}</h5>
                    <p className="card-text"><strong>Match Score:</strong> {match.matchScore}</p>
                    <p className="card-text">{match.bio}</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
      <Link to="/" className="btn btn-secondary mt-3">Back to Survey</Link>
    </div>
  );
};

export default Matches;
