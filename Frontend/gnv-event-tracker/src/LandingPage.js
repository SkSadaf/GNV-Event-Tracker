import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderLanding from './HeaderLanding';
import MapPage from './MapPage';

const LandingPage = () => {
  return (
    <div>
      <HeaderLanding /> {/* Use HeaderLanding here */}
      {/* Main content for the landing page can go here */}
      <Routes>
        <Route path="map" element={<MapPage />} /> {/* Example Route for Map */}
      </Routes>
    </div>
  );
};

export default LandingPage;