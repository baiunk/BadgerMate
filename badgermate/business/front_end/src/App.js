import React, { useState } from "react";
import MapSelector from "./MapSelector";

const App = () => {
  const [selectedAreas, setSelectedAreas] = useState([]);

  const handleNext = () => {
    if (selectedAreas.length === 0) {
      alert("Please select at least one area!");
      return;
    }

    console.log("User selected areas:", selectedAreas);

    fetch("http://localhost:5000/save_selected_areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedAreas }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Response from backend:", data))
      .catch((err) => console.error("Error sending data:", err));
  };

  return (
    <div>
      <h1>Select Areas in Madison</h1>
      <MapSelector onLocationSelect={setSelectedAreas} />

      <div>
        <h3>Selected Areas:</h3>
        <ul>
          {selectedAreas.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleNext}
        style={{ marginTop: "20px", padding: "10px", fontSize: "16px" }}
      >
        Next
      </button>
    </div>
  );
};

export default App;
