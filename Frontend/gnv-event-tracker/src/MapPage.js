import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function MapPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gainesvillePosition = [29.6516, -82.3248];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/GetAllEvents');
        const filteredEvents = response.data.filter(
          event => event.latitude !== 0 && event.longitude !== 0
        );
        setEvents(filteredEvents);
        setLoading(false);
      } catch (err) {
        setError('Error fetching events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>{error}</div>;

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
            
            {events.map((event) => (
              <Marker 
                key={event.id} 
                position={[event.latitude, event.longitude]}
                title={event.name}
              >
                <Popup>
                  <div>
                    <h3>{event.name}</h3>
                    <p>{event.description}</p>
                    <Link to={`/events/${event.id}`} state={{ userId: 'mockUserId' }}>
                      <h3>{event.name}</h3>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default MapPage;