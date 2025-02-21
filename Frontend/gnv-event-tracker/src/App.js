// import React from 'react';
import './App.css';
import Header from './Header';
import Main from './Main';
import SignUp from './SignUp';
import Login from './Login';
import LandingPage from './LandingPage';
import MapPage from './MapPage';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
      <Routes>
          <Route path="/landing/*" element={<LandingPage />} />
          <Route path="*" element={<Header />} />
        </Routes>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Main />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;