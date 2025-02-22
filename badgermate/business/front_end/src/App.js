import React from "react";
import MapSelector from "./MapSelector";

const App = () => {
  const handleLocationSelect = async (location) => {
    console.log("Selected location:", location);

    await fetch("http://localhost:5000/save_location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: location.lat, lng: location.lng }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Response from backend:", data))
      .catch((err) => console.error("Error sending data:", err));
  };

  return (
    <div>
      <h1>Select a Location in Madison</h1>
      <MapSelector onLocationSelect={handleLocationSelect} />
    </div>
  );
};

export default App;
