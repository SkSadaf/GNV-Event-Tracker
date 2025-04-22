// import React from 'react';
import './App.css';
import Header from './Header';
import Main from './Main';
import SignUp from './SignUp';
import HeaderLanding from './HeaderLanding';
import Login from './Login';
import LandingPage from './LandingPage';
import MapPage from './MapPage';
import Dashboard from './Dashboard';
import AllEvents from './AllEvents';
import EventDetails from './EventDetails';
import { UserProvider } from './UserContext';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationService';
import CreateEvent from './CreateEvent';
import UserProfile from './UserProfile';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <UserProvider>
    <Router>
      <AuthProvider>
      <NotificationProvider>
      <div>
      <Routes>
          {/* <Route path="/landing/*" element={<LandingPage />} /> */}
          <Route path="/dashboard" element={<HeaderLanding />} />
          <Route path="*" element={<Header />} />
          <Route path="/events" element={<HeaderLanding />} />
          <Route path="/events/:eventId" element={<HeaderLanding />} />
          <Route path="/map" element={<HeaderLanding />} />
          <Route path="/create-event" element={<HeaderLanding />} />
          <Route path="/profile/:userId" element={<HeaderLanding />} />
        </Routes>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Main />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<AllEvents />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
        </Routes>
      </div>
      </NotificationProvider>
      </AuthProvider>
    </Router>
    </UserProvider>
  );
}

export default App;