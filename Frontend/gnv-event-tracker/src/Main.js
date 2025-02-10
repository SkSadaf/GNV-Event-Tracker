// // Main.js
// import React from 'react';

// const Main = () => {
//   return (
//     <main>
//       <section>
//         <h2>Welcome to Gainesville Events</h2>
//         <p>
//           Track events happening in Gainesville (e.g., farmer's markets, concerts etc.), create itineraries, and share experiences.
//           Our application includes features like weather forecasts, location/preference based recommendations and daily itineraries,
//           interactive map feature, reviews, ratings and comments for events. Users can form groups, interact with each other and
//           discover similar interests. Users may also manually post their own events for others to join in/sign up for. The application
//           provides real-timesrc notifications about new events or any changes made to existing events. Suggestions on transit are also
//           provided to give users the optimal way to get to where they need to go depending on distance, cost and parking availability.
//         </p>
//       </section>
//     </main>
//   );
// };

// export default Main;

// Main.js
import React from 'react';

const Main = () => {
  return (
    <main>
      <section className="hero">
        <h1>Welcome to Gainesville Events</h1>
        <p>
          Track events happening in Gainesville, create itineraries, and share experiences.  
          Our application includes features like weather forecasts, location/preference based recommendations and daily itineraries,
          interactive map feature, reviews, ratings and comments for events. Users can form groups, interact with each other and
          discover similar interests. Users may also manually post their own events for others to join in/sign up for. The application
          provides real-time notifications about new events or any changes made to existing events. Suggestions on transit are also
          provided to give users the optimal way to get to where they need to go depending on distance, cost and parking availability.
        </p>
        
        <h2>Discover the Best of Gainesville, One Event at a Time.</h2>
        <p>Gainesville Events is your comprehensive guide to local happenings, making it easy to find, plan, and experience the city's vibrant culture.</p>

        <div className="feature-card">
          <h3>Interactive Map</h3>
          <p>Discover events near you with our interactive map. Easily filter by category and date.</p>
        </div>

        <div className="feature-card">
          <h3>Event Recommendations</h3>
          <p>Get personalized recommendations tailored to your interests and location.</p>
        </div>

        <div className="feature-card">
          <h3>User-Generated Content</h3>
          <p>Share your experiences, rate events, and connect with fellow event-goers.</p>
        </div>

        <div className="feature-card">
          <h3>Group Creation</h3>
          <p>Form groups with friends to coordinate your outings.</p>
        </div>

        <h2>Benefits of Using Gainesville Events</h2>
        <ul>
          <li>Uncover Hidden Gems: Find local events you might have missed.</li>
          <li>Effortless Planning: Create personalized itineraries based on your interests.</li>
          <li>Connect with the Community: Meet new people and share experiences with fellow event-goers.</li>
          <li>Never Miss Out: Get notified about new events and updates in real time.</li>
        </ul>
      </section>

    </main>
  );
};

export default Main;