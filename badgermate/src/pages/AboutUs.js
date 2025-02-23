// src/pages/AboutUs.js
import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mt-5">
      <h2>About BadgerMate</h2>
      <p>
        Finding a compatible roommate can be a stressful and time-consuming process. Many existing roommate-matching platforms rely on basic filtering options and manual searching, often leading to mismatches and frustration. BadgerMate was developed to solve this problem by using a data-driven approach to match users based on their lifestyle preferences, habits, and expectations. By collecting structured responses through a survey, BadgerMate calculates a matchability score, filtering out incompatible users based on location, budget, and gender preferences before ranking potential roommates. This automated system improves the roommate selection process, making it faster, easier, and more reliable for users.
      </p>

      <section>
        <h3>How It Works</h3>
        <p>
          Users complete a structured survey detailing their personal habits, preferences, and expectations for a roommate. The system processes these responses using a matchability scoring algorithm, which filters potential matches based on key factors like location, budget, and gender preferences before ranking the most compatible options.
        </p>
      </section>

      <section>
        <h3>Key Features</h3>
        <ul>
          <li>
            <strong>Data-Driven Matching</strong> – Encodes user responses and applies a weighted compatibility score.
          </li>
          <li>
            <strong>Smart Filtering</strong> – Eliminates non-compatible options based on location, budget, and lifestyle.
          </li>
          <li>
            <strong>Top Matches Stored Efficiently</strong> – Uses a min-heap to maintain the best 10 matches per user.
          </li>
          <li>
            <strong>Scalability & Automation</strong> – Supports dynamic survey updates to ensure flexibility for future improvements.
          </li>
        </ul>
      </section>

      <section>
        <h3>Future Enhancements</h3>
        <p>
          BadgerMate aims to evolve by integrating apartment listings, adding a chat feature, and enhancing the matching algorithm with activity-based scoring to refine roommate recommendations over time.
        </p>
      </section>

      <section>
        <h3>Contributors</h3>
        <ul>
          <li>Ibraheem Aldosery</li>
          <li>Fars Alkheleiwi</li>
          <li>Marwan Almazroy</li>
          <li>Rashed Almansoori</li>
        </ul>
      </section>

      <p>
        Developed by MadData25, BadgerMate is a data-driven roommate solution built to simplify and improve the roommate-finding experience.
      </p>
      <p>
        Github Repository: <a href="https://github.com/baiunk/BadgerMate" target="_blank" rel="noopener noreferrer">BadgerMate on GitHub</a>
      </p>
    </div>
  );
};

export default AboutUs;
