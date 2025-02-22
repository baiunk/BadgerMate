import { MapContainer, TileLayer, Rectangle, Popup } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const MapSelector = ({ onLocationSelect }) => {
  const [selectedArea, setSelectedArea] = useState(null);

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
      name: "south ",
      bounds: [
        [43.0, -89.43],
        [43.05, -89.33],
      ],
    },
  ];

  return (
    <MapContainer
      center={[43.0731, -89.4012]} // Centered in Madison
      zoom={12}
      minZoom={11}
      maxBounds={madisonBounds} // Restrict movement
      maxBoundsViscosity={1.0} // Hard lock to Madison
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Display selectable areas */}
      {areas.map((area, index) => (
        <Rectangle
          key={index}
          bounds={area.bounds}
          eventHandlers={{
            click: () => {
              setSelectedArea(area.name);
              if (onLocationSelect) {
                onLocationSelect({ area: area.name });
              }
            },
          }}
          pathOptions={{ color: selectedArea === area.name ? "blue" : "red" }}
        >
          <Popup>{area.name}</Popup>
        </Rectangle>
      ))}
    </MapContainer>
  );
};

export default MapSelector;
