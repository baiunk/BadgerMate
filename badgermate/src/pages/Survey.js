// src/pages/Survey.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Survey = () => {
  const navigate = useNavigate();
  const totalSteps = 9;
  const [currentStep, setCurrentStep] = useState(0);

  // Left side answers (your qualities)
  const [myGender, setMyGender] = useState('');
  const [myCleanliness, setMyCleanliness] = useState('');
  const [mySleep, setMySleep] = useState('');
  const [mySocial, setMySocial] = useState('');
  const [mySmoking, setMySmoking] = useState('');
  const [myPet, setMyPet] = useState('');
  const [myQuiet, setMyQuiet] = useState('');
  const [myLocation, setMyLocation] = useState('');
  const [myGuests, setMyGuests] = useState('');

  // Right side answers (roommate preferences)
  const [genderPref, setGenderPref] = useState([]);
  const [roommateCleanlinessPref, setRoommateCleanlinessPref] = useState('');
  const [roommateSleepPref, setRoommateSleepPref] = useState('');
  const [roommateSocialPref, setRoommateSocialPref] = useState('');
  const [roommateSmokingPref, setRoommateSmokingPref] = useState('');
  const [roommatePetPref, setRoommatePetPref] = useState('');
  const [roommateQuietPref, setRoommateQuietPref] = useState('');
  // Updated: single budget value starting at 500
  const [budget, setBudget] = useState(500);
  const [roommateGuestsPref, setRoommateGuestsPref] = useState('');

  // Toggle for multiple selection on roommate gender preference
  const handleGenderPrefChange = (option) => {
    if (genderPref.includes(option)) {
      setGenderPref(genderPref.filter((g) => g !== option));
    } else {
      setGenderPref([...genderPref, option]);
    }
  };

  // Basic validation for each step
  const validateStep = (step) => {
    switch (step) {
      case 0:
        return myGender !== '' && genderPref.length > 0;
      case 1:
        return myCleanliness !== '' && roommateCleanlinessPref !== '';
      case 2:
        return mySleep !== '' && roommateSleepPref !== '';
      case 3:
        return mySocial !== '' && roommateSocialPref !== '';
      case 4:
        return mySmoking !== '' && roommateSmokingPref !== '';
      case 5:
        return myPet !== '' && roommatePetPref !== '';
      case 6:
        return myQuiet !== '' && roommateQuietPref !== '';
      case 7:
        return myLocation !== '' && budget >= 500;
      case 8:
        return myGuests !== '' && roommateGuestsPref !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert("Please answer both questions before proceeding.");
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const surveyData = {
      Gender: myGender,
      Gender_Pref: genderPref,
      Cleanliness: myCleanliness,
      Cleanliness_Pref: roommateCleanlinessPref,
      Sleep: mySleep,
      Sleep_Pref: roommateSleepPref,
      Social: mySocial,
      Social_Pref: roommateSocialPref,
      Smoking: mySmoking,
      Smoking_Pref: roommateSmokingPref,
      Pet: myPet,
      Pet_Pref: roommatePetPref,
      Quiet: myQuiet,
      Quiet_Pref: roommateQuietPref,
      Location: myLocation,
      budget: budget,
      Guests: myGuests,
      Guests_Pref: roommateGuestsPref,
    };
    navigate('/matches', { state: surveyData });
  };

  // Fixed container styles for question text and answer options
  const questionContainerStyle = { position: 'relative', height: '12rem', overflow: 'visible' };
  const answerOptionsStyle = { position: 'absolute', top: '4rem', left: 0, right: 0, zIndex: 100 };

  // Render left side (your qualities) questions by step
  const renderLeftQuestion = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={questionContainerStyle}>
            <h5>What is your gender?</h5>
            <div className="d-flex flex-column" style={answerOptionsStyle}>
              {['Male', 'Female', 'Other'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${myGender === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMyGender(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div style={questionContainerStyle}>
            <h5>How would you describe your personal hygiene?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Very Clean', 'Clean', 'Normal', 'Messy', 'Very Messy'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${myCleanliness === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMyCleanliness(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div style={questionContainerStyle}>
            <h5>How would you describe your sleep schedule?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Night Owl', 'Early Bird'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${mySleep === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMySleep(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div style={questionContainerStyle}>
            <h5>Would you describe yourself as more of an introvert or an extrovert?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Introvert', 'Extrovert'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${mySocial === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMySocial(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div style={questionContainerStyle}>
            <h5>Do you smoke?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Yes', 'No'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${mySmoking === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMySmoking(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div style={questionContainerStyle}>
            <h5>Do you have a pet?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Yes', 'No'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${myPet === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMyPet(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div style={questionContainerStyle}>
            <h5>How would you describe the ambient noise level you typically maintain in your daily life?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Very Quiet', 'Quiet', 'Normal', 'Loud', 'Very Loud'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${myQuiet === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMyQuiet(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div style={questionContainerStyle}>
            <h5>Which area are you looking to live in?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['East', 'West', 'Campus', 'South'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${myLocation === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMyLocation(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 8:
        return (
          <div style={questionContainerStyle}>
            <h5>How frequently do you have guests over?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Frequently', 'Rarely', 'Never'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${myGuests === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setMyGuests(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render right side (roommate preferences) questions by step
  // Note: Step 7 (budget) is now a single slider from 500 to 2500 with a step size of 50.
  const renderRightQuestion = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={questionContainerStyle}>
            <h5>What gender do you prefer your roommate to have? (Select all that apply)</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Male', 'Female', 'Other'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${genderPref.includes(option) ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => handleGenderPrefChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div style={questionContainerStyle}>
            <h5>What personal hygiene would you like your roommate to have?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Very Clean', 'Clean', 'Normal', 'Messy', 'Very Messy'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommateCleanlinessPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommateCleanlinessPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div style={questionContainerStyle}>
            <h5>What sleep schedule would you like your roommate to have?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Night Owl', 'Early Bird', 'Any'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommateSleepPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommateSleepPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div style={questionContainerStyle}>
            <h5>What social style do you prefer in a roommate? (Introvert, Extrovert, or Any)</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Introvert', 'Extrovert', 'Any'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommateSocialPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommateSocialPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div style={questionContainerStyle}>
            <h5>Are you okay with your roommate being a smoker?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Yes', 'No', "Don't Mind"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommateSmokingPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommateSmokingPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div style={questionContainerStyle}>
            <h5>Are you okay with having a pet in your apartment?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Yes', 'No', "Don't Mind"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommatePetPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommatePetPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div style={questionContainerStyle}>
            <h5>What noise level do you prefer your roommate to maintain?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Very Quiet', 'Quiet', 'Normal', 'Loud', 'Very Loud'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommateQuietPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommateQuietPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div style={questionContainerStyle}>
            <h5>What is your monthly budget for rent?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              <Slider
                min={500}
                max={2500}
                step={50}
                value={budget}
                onChange={setBudget}
              />
              <p className="mt-3">
                Budget: ${budget} {budget === 2500 && '(2500+)'}
              </p>
            </div>
          </div>
        );
      case 8:
        return (
          <div style={questionContainerStyle}>
            <h5>How often would you like your roommate to have guests over?</h5>
            <div style={answerOptionsStyle} className="d-flex flex-column">
              {['Frequently', 'Rarely', 'Never', "Don't Mind"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn ${roommateGuestsPref === option ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100 mb-3`}
                  onClick={() => setRoommateGuestsPref(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="mb-4">BadgerMate Roommate Finder Survey</h2>
      <div className="card p-5">
        <div className="row">
          <div className="col-md-6">{renderLeftQuestion()}</div>
          <div className="col-md-6">{renderRightQuestion()}</div>
        </div>
        {/* Fixed Next button container */}
        <div style={{ position: 'relative', height: '15rem' }}>
          <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <button type="button" className="btn btn-success btn-lg" onClick={handleNext}>
              {currentStep === totalSteps - 1 ? 'Submit Survey' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
