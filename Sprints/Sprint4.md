<h1>Sprint 4 Report</h1>

<h2>Tasks Completed During Sprint 4</h2>
<ul>
  <li>Added search bar in the All Events page</li>
  <li>Added images in each individual events page</li>
  <li>Added notification feature and tested it </li>
  <li>Cypress test for Search functionality in all events page</li>
  <li>Jest Unit test for login page, SignUp page, all events page, create event page, user profile</li>
  <li>Enhanced CSS</li>
  <li>Added more information on the individual event details page</li>
  <li>Modified backend server to start before scraping</li>
  <li>Added backend API for broadcasting real-time notification updates with websocket</li>
  <li>Added health check API to check if backend server is up</li>
  <li>Modified Remove user to handle cases to unmap user from event, delete events created by the user, remove user as an organizer and delete the user according to new organizer id sequence mapping to event</li>
  <li>Modifed user name displayed in comments when user profile is deleted and comment updated in the events table</li>
  <li>Added weather API to provide current and future weather forecasts</li>
  <li>Modified create event to map user to organizer table with user details and new sequence id of organizer and check if user email already exists as an organizer</li>
<li>Duplicate email check added for create organizer API</li>
<li>Populate latitude longitude updated for different format of location strings for scraped events</li>
<li>Added and modified golang test cases</li>
  

</ul>

<h2>Frontend</h2>

<h3>Unit Tests</h3>
<ul>
  <li>Sign Up page - unit test is done for this which covers form display, input, submission, errors</li>
  <li>Login page - unit test is done for this which covers form display, input, submission, errors</li>
  <li>Search - unit test needs is dones</li>
  <li>Log out - unit test needs is done</li>
  <li>User Profile - unit test is done for this which covers edit profile and delete profile.</li>
  <li>Create event page- unit test is done for this which covers form display, input, tags, cancel button, event creation, errors, handling empty fields  </li>
</ul>

<h3>Cypress Tests</h3>
<ul>
  <li>Mainpage - e2e test</li>
  <li>Dashboard - e2e test is done for this which covers unregister, create event and displaying of content</li>
  <li>Event details- e2e tests are done wich covers content display, users registration state, comment, registration functionality</li>
  <li>Map page- e2e test are done that covers content, map, pins, pop up , link in pop up</li>
  <li>All Events- e2e test is done for this which covers content(list of events), links</li>
</ul>
