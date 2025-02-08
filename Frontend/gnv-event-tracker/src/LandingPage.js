// src/LandingPage.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
//import Dashboard from './Dashboard';
//import MapPage from 'src/MapPage';
//import MapPag from 'src/MapPag';
//import EventsPage from './EventsPage';
//import './styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="dashboard" element={<Dashboard />} />}
        {/* <Route path="map" element={<MapPag />} /> */}
        {/*<Route path="events" element={<EventsPage />} /> */}
      </Routes>
    </div>
  );
};

export default LandingPage;