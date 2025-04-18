
import React from 'react';
import './styles/Main.css'; // You'll need to create this CSS file

const Main = () => {
  return (
    <main className="main-container">
      <section className="hero">
        <div className="hero-content">
          <h1 className="main-title">Welcome to Gainesville Events</h1>
          <p className="hero-tagline">Discover the Best of Gainesville, One Event at a Time.</p>
          
          <div className="hero-description">
            <p>
              Your comprehensive guide to exploring Gainesville's vibrant culture and community events.
              Find local happenings, register for events and share your experience with fellow event enthusiasts.
            </p>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">What You Can Do</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Discover Events</h3>
            <p>Search and browse through a curated collection of Gainesville's most exciting events.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Interactive Map</h3>
            <p>Find events near you with our dynamic, easy-to-navigate map interface.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Create Itineraries</h3>
            <p>Plan your perfect day or weekend with customized event schedules.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Share Experiences</h3>
            <p>Rate events, post photos, and share your thoughts with the community.</p>
          </div>
        </div>
      </section>
      
      <section className="benefits-section">
        <h2 className="section-title">Why Use Gainesville Events?</h2>
        
        <div className="benefits-container">
          <div className="benefit-item">
            <div className="benefit-icon">💎</div>
            <div className="benefit-text">
              <h3>Uncover Hidden Gems</h3>
              <p>Discover local events and venues you might have otherwise missed.</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">📅</div>
            <div className="benefit-text">
              <h3>Effortless Planning</h3>
              <p>Create personalized itineraries tailored to your interests and schedule.</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">👥</div>
            <div className="benefit-text">
              <h3>Connect with Community</h3>
              <p>Meet new people and build connections with fellow event-goers.</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">🔔</div>
            <div className="benefit-text">
              <h3>Stay Updated</h3>
              <p>Receive notifications about new events matching your interests.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Explore Gainesville?</h2>
          <p>Start discovering events and creating memorable experiences today.</p>
        </div>
      </section>
    </main>
      
  );
};

export default Main;