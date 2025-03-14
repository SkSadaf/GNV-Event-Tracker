import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import eventsData from './events';
import './App.css';
import { Link } from 'react-router-dom';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function MapPage() {
  // Gainesville, Florida coordinates
  const gainesvillePosition = [29.6516, -82.3248];

  return (
    <div className="map-container">
      <h1>Events in Gainesville, Florida</h1>
      <div className="map-wrapper">
        {typeof window !== 'undefined' && (
          <MapContainer 
            center={gainesvillePosition} 
            zoom={13} 
            scrollWheelZoom={false}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {eventsData.map((event) => (
              <Marker 
                key={event.id} 
                position={[event.latitude, event.longitude]}
                title={event.name}
              >
                <Popup>
                  <div>
                    <h3>{event.name}</h3>
                    <p>{event.description}</p>
                    <Link to={`/event/${event.id}`}>More Details</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}

export default MapPage;