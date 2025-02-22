import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const MapSelector = ({ onLocationSelect }) => {
  const [marker, setMarker] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMarker(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng);
        }
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[43.0731, -89.4012]} // Madison, WI center
      zoom={12}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler />
      {marker && <Marker position={marker} />}
    </MapContainer>
  );
};

export default MapSelector;
