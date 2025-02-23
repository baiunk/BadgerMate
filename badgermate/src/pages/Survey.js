// src/pages/Survey.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Slider from 'rc-slider';
import CustomSlider from './customSlider';
import 'rc-slider/assets/index.css';

const Survey = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const { userId } = location.state || {};

  useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]);

  // We'll fetch a list of survey items. Each item is an object that may have:
  // - "question" (the main question)
  // - "preference_question" (optional paired question)
  const [surveyItems, setSurveyItems] = useState([]);
  // current index into the surveyItems array
  const [currentIndex, setCurrentIndex] = useState(0);
  // Store responses keyed by variable_name (for both question and preference_question)
  const [responses, setResponses] = useState({});

  // Fetch the survey data when the component mounts
  useEffect(() => {
    axios.get('https://badgermate.onrender.com/api/get_all_questions')
          .then((res) => {
        // Expect the API to return { questions: [ ... ] }
        // (Each item might be a pair or a single question.)
        // We assume the API already returns the items in the desired order.
      const questions = res.data.questions;
      setSurveyItems(questions);
      
      // Pre-populate default responses for slider-type questions.
      const initialResponses = {};
      questions.forEach(item => {
        const main = item.question;
        if (main.html_input_type === "range") {
          initialResponses[main.variable_name] = parseInt(main.html_attributes.value, 10);
        }
        if (item.preference_question && item.preference_question.html_input_type === "range") {
          initialResponses[item.preference_question.variable_name] = parseInt(item.preference_question.html_attributes.value, 10);
        }
      });
      setResponses(initialResponses);
    })
      .catch((err) => {
        console.error("Error fetching survey questions:", err);
      });
  }, []);

  if (surveyItems.length === 0) {
    return <div className="container mt-5">Loading survey...</div>;
  }

  // The current survey item
  const currentItem = surveyItems[currentIndex];

  // Generic handler to update a response by variable name
  const updateResponse = (variable, value) => {
    setResponses(prev => ({ ...prev, [variable]: value }));
  };

  // Renders an input for a given question configuration
  const renderInput = (q) => {
    switch (q.html_input_type) {
      case "radio":
        return (
          <>
            {q.possible_answers.map(answer => (
              <label key={answer} className="form-check form-check-option">
                <input 
                  type="radio" 
                  name={q.variable_name}
                  value={answer}
                  required={q.html_attributes.required}
                  onChange={() => updateResponse(q.variable_name, answer)}
                  checked={responses[q.variable_name] === answer}
                />
                <span>{answer}</span>
              </label>
            ))}
          </>
        );
        case "checkbox": {
          const selected = responses[q.variable_name] || [];
          const handleCheckboxChange = (answer) => {
            let newSelected = [...selected];
            if (newSelected.includes(answer)) {
              newSelected = newSelected.filter(a => a !== answer);
            } else {
              newSelected.push(answer);
            }
            updateResponse(q.variable_name, newSelected);
          };
          return (
            <>
              {q.possible_answers.map(answer => (
                <label key={answer} className="form-check form-check-option">
                  <input 
                    type="checkbox" 
                    name={q.variable_name}
                    value={answer}
                    required={q.html_attributes.required}
                    onChange={() => handleCheckboxChange(answer)}
                    checked={selected.includes(answer)}
                  />
                  <span>{answer}</span>
                </label>
              ))}
            </>
          );
        }
      case "range":
        // For slider-type questions. Here we assume possible_answers contains [min, max, step, default]
        // For example, Budget question might have: min: 500, max: 5000, step: 50, value: 1200.
        return (
          <>
            <Slider
              min={parseInt(q.html_attributes.min, 10)}
              max={parseInt(q.html_attributes.max, 10)}
              step={parseInt(q.html_attributes.step, 10)}
              value={responses[q.variable_name] || parseInt(q.html_attributes.value, 10)}
              onChange={value => updateResponse(q.variable_name, value)}
            />
            <p className="slider mt-2">
              Selected: ${responses[q.variable_name] || q.html_attributes.value} {responses[q.variable_name] === q.html_attributes.max && `( ${q.html_attributes.max}+ )`}
            </p>
          </>
        );
      case "text":
        return (
          <input 
            type="text" 
            name={q.variable_name}
            className="form-control"
            required={q.html_attributes.required}
            value={responses[q.variable_name] || ""}
            onChange={(e) => updateResponse(q.variable_name, e.target.value)}
          />
        );
      case "number":
        return (
          <input 
            type="number" 
            name={q.variable_name}
            className="form-control"
            required={q.html_attributes.required}
            value={responses[q.variable_name] || ""}
            onChange={(e) => updateResponse(q.variable_name, e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  // Check that for the current survey item, all required responses have been provided.
  const isCurrentItemValid = () => {
    // Validate main question
    const q = currentItem.question;
    if (
      responses[q.variable_name] === undefined ||
      responses[q.variable_name] === "" ||
      (Array.isArray(responses[q.variable_name]) && responses[q.variable_name].length === 0)
    ) {
      return false;
    }
    // If there's a preference_question, validate it too.
    if (currentItem.preference_question) {
      const pq = currentItem.preference_question;
      if (
        responses[pq.variable_name] === undefined ||
        responses[pq.variable_name] === "" ||
        (Array.isArray(responses[pq.variable_name]) && responses[pq.variable_name].length === 0)
      ) {
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!isCurrentItemValid()) {
      alert("Please answer the question(s) before proceeding.");
      return;
    }
    if (currentIndex < surveyItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const finalSurveyData = {
        userId, // from useLocation or context
        responses,
      };
  
      try {
        // Post the data to the API endpoint
        console.log(finalSurveyData);
        const response = await axios.post('https://badgermate.onrender.com/api/submit_all_answers', finalSurveyData);
        console.log("Survey submitted successfully:", response.data);
        // Navigate to matches page, or display a confirmation
        navigate('/matches', { state: { matches: response.data.matches } });
      } catch (error) {
        console.error("Error submitting survey:", error);
        alert("There was an error submitting your survey. Please try again.");
      }
    }
  };

  // We'll use a simple container style for each question item.
  const containerStyle = { marginBottom: '3rem' };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">BadgerMate Survey</h2>
      <div className="card p-4">
        {/* If the current item has both question and preference_question, display them in two columns */}
        {currentItem.question && currentItem.preference_question ? (
          <div className="row">
          <div className="col-md-6">
            <div className="question-container">
              <h5>{currentItem.question.question_text}</h5>
            </div>
            <div className="answer-options">
              {renderInput(currentItem.question)}
            </div>
          </div>
          <div className="col-md-6">
            <div className="question-container">
              <h5>{currentItem.preference_question.question_text}</h5>
            </div>
            <div className="answer-options">
              {renderInput(currentItem.preference_question)}
            </div>
          </div>
        </div>
        ) : (
          // Otherwise, display the single question in full width.
          <div style={containerStyle}>
            <h5>{currentItem.question.question_text}</h5>
            <div className="mt-3">
              {renderInput(currentItem.question)}
            </div>
          </div>
        )}
        <div className="text-end">
          <button className="btn btn-success btn-lg" onClick={handleNext}>
            {currentIndex === surveyItems.length - 1 ? 'Submit Survey' : 'Next'}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <p>Question group {currentIndex + 1} of {surveyItems.length}</p>
      </div>
    </div>
  );
};

export default Survey;
