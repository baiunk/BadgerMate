import { MapContainer, TileLayer, Rectangle, Popup } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const MapSelector = ({ onLocationSelect }) => {
  const [selectedAreas, setSelectedAreas] = useState([]); // Store multiple selections

  // Restrict map movement to Madison boundaries
  const madisonBounds = [
    [43.005, -89.57], // Southwest corner
    [43.133, -89.28], // Northeast corner
  ];

  // Define predefined areas in Madison
  const areas = [
    {
      name: "Downtown",
      bounds: [
        [43.066, -89.39],
        [43.1, -89.36],
      ],
    },
    {
      name: "West Side",
      bounds: [
        [43.0, -89.55],
        [43.09, -89.43],
      ],
    },
    {
      name: "East Side",
      bounds: [
        [43.08, -89.36],
        [43.2, -89.29],
      ],
    },
    {
      name: "Near Campus",
      bounds: [
        [43.05, -89.43],
        [43.085, -89.39],
      ],
    },
    {
      name: "South",
      bounds: [
        [43.0, -89.43],
        [43.05, -89.33],
      ],
    },
  ];

  // Toggle area selection on click
  const toggleSelection = (area) => {
    setSelectedAreas((prevSelected) => {
      if (prevSelected.includes(area.name)) {
        // Remove from selection if already selected
        const updatedSelection = prevSelected.filter((a) => a !== area.name);
        onLocationSelect(updatedSelection); // Send updated selection to parent
        return updatedSelection;
      } else {
        // Add new selection
        const updatedSelection = [...prevSelected, area.name];
        onLocationSelect(updatedSelection); // Send updated selection to parent
        return updatedSelection;
      }
    });
  };

  return (
    <MapContainer
      center={[43.0731, -89.4012]} // Centered in Madison
      zoom={12}
      minZoom={11}
      maxBounds={madisonBounds} // Restrict movement
      maxBoundsViscosity={1.0} // Hard lock to Madison
      style={{ height: "500px", width: "100%" }}
    >
      {/* Minimalist Tile Layer (removes water) */}
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" />

      {/* Display selectable areas */}
      {areas.map((area, index) => (
        <Rectangle
          key={index}
          bounds={area.bounds}
          eventHandlers={{
            click: () => toggleSelection(area),
          }}
          pathOptions={{
            color: selectedAreas.includes(area.name) ? "blue" : "red",
            fillOpacity: 0.5,
          }}
        >
          <Popup>{area.name}</Popup>
        </Rectangle>
      ))}
    </MapContainer>
  );
};

export default MapSelector;
