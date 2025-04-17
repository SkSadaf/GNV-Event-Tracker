// // Main.js
// import React from 'react';

// const Main = () => {
//   return (
//     <main>
//       <section className="hero">
//         <h1>Welcome to Gainesville Events</h1>
//         <p>
//           Track events happening in Gainesville, create itineraries, and share experiences.  
//           Our application includes features like weather forecasts, location/preference based recommendations and daily itineraries,
//           interactive map feature, reviews, ratings and comments for events. Users can form groups, interact with each other and
//           discover similar interests. Users may also manually post their own events for others to join in/sign up for. The application
//           provides real-time notifications about new events or any changes made to existing events. Suggestions on transit are also
//           provided to give users the optimal way to get to where they need to go depending on distance, cost and parking availability.
//         </p>
        
//         <h2>Discover the Best of Gainesville, One Event at a Time.</h2>
//         <p>Gainesville Events is your comprehensive guide to local happenings, making it easy to find, plan, and experience the city's vibrant culture.</p>

//         <div className="feature-card">
//           <h3>Interactive Map</h3>
//           <p>Discover events near you with our interactive map. Easily filter by category and date.</p>
//         </div>

//         <div className="feature-card">
//           <h3>Event Recommendations</h3>
//           <p>Get personalized recommendations tailored to your interests and location.</p>
//         </div>

//         <div className="feature-card">
//           <h3>User-Generated Content</h3>
//           <p>Share your experiences, rate events, and connect with fellow event-goers.</p>
//         </div>

//         <div className="feature-card">
//           <h3>Group Creation</h3>
//           <p>Form groups with friends to coordinate your outings.</p>
//         </div>

//         <h2>Benefits of Using Gainesville Events</h2>
//         <ul>
//           <li>Uncover Hidden Gems: Find local events you might have missed.</li>
//           <li>Effortless Planning: Create personalized itineraries based on your interests.</li>
//           <li>Connect with the Community: Meet new people and share experiences with fellow event-goers.</li>
//           <li>Never Miss Out: Get notified about new events and updates in real time.</li>
//         </ul>
//       </section>

//     </main>
//   );
// };

// export default Main;

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