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
  <li>Modified user name displayed in comments when user profile is deleted and comment updated in the events table</li>
  <li>Added weather API to provide current and future weather forecasts</li>
  <li>Modified create event to map user to organizer table with user details and new sequence id of organizer and check if user email already exists as an organizer</li>
  <li>Duplicate email check added for create organizer API</li>
  <li>Populate latitude longitude updated for different formats of location strings for scraped events</li>
  <li>Added and modified golang test cases</li>
  <li>Scraped event organizer info: names, emails, phone numbers</li>
  <li>Scraped image URLs for events</li>
  <li>Scraped event website and ticket URLs</li>
  <li>Updated ScrapeVisitGainesville() to match ScrapeGainesvilleSun() functionality</li>
  

</ul>

<h2>Frontend</h2>

<h3>Unit Tests</h3>
<ul>
  <li><strong>Sign Up</strong> - unit test is done for this which covers form display, input, submission, errors</li>
  <li><strong>Login</strong> - unit test is done for this which covers form display, input, submission, errors</li>
  <li><strong>Search</strong> - unit test is done which covers different cases of search</li>
  <li><strong>Log out</strong> - unit test is done which checks the logout button functionality</li>
  <li><strong>User Profile</strong> - unit test is done for this which covers edit profile and delete profile.</li>
  <li><strong>Create event form</strong> - unit test is done for this which covers form display, input, tags, cancel button, event creation, errors, handling empty fields</li>
</ul>

<h3>Cypress Tests</h3>
<ul>
  <li><strong>Mainpage</strong> - e2e test</li>
<li><strong>Dashboard</strong> - e2e test is done for this which covers unregister, create event and displaying of content</li>
<li><strong>Event details</strong> - e2e tests are done which cover content display, users registration state, comment, registration functionality</li>
<li><strong>Map page</strong> - e2e tests are done that cover content, map, pins, pop up, link in pop up</li>
<li><strong>All Events</strong> - e2e test is done for this which covers content (list of events), links</li>
</ul>


<h3>Backend API Documentation</h3>

**1. CreateEvent API**

**Request Method:**
POST

**URL:**
http://localhost:8080/CreateEvent

<img width="1006" alt="image" src="https://github.com/user-attachments/assets/24c25ef5-ba71-4d02-80a7-b02b64a71941" />

**Sample Response**

<img width="1010" alt="image" src="https://github.com/user-attachments/assets/0d5cb10c-2910-44fb-b057-c47079059c04" />


**2. EditEvent API**

**Request Method:**
PUT

**URL:**
localhost:8080/EditEvent/{event.ID}

![image](https://github.com/user-attachments/assets/e5be6295-89c3-4e16-ba84-95986657098c)

**Sample Response**

![image](https://github.com/user-attachments/assets/1f9b0889-6c0d-42e2-bbe7-11d6bc8e6ab8)


**3. DeleteEvent API**

**Request Method:**
DEL

**URL:**
localhost:8080/DeleteEvent/{event.ID}

![image](https://github.com/user-attachments/assets/f485d577-8338-422f-b943-a3f823da55a3)

**Sample Response**

![image](https://github.com/user-attachments/assets/c2a289ae-6779-4fbe-8b10-96d60ae97b3a)


**4. GetAllEvents API**

**Request Method:**
GET

**URL:**
localhost:8080/GetAllEvents

![image](https://github.com/user-attachments/assets/21e8f501-8844-44b1-8d7f-c7e29e43f992)

**Sample Response**

![image](https://github.com/user-attachments/assets/7520b521-c00f-46f5-adee-38f07bcec321)


**5. GetEventByID API**

**Request Method:**
GET

**URL:**
localhost:8080/GetEvent/{event.ID}

<img width="1010" alt="image" src="https://github.com/user-attachments/assets/525295bb-c04c-4294-8ce0-b055ad8a2541" />


**Sample Response**

<img width="1002" alt="image" src="https://github.com/user-attachments/assets/76085d20-e78e-4358-b52e-854764327b62" />


**6. AddCommentToEvent API**

**Request Method:**
POST

**URL:**
localhost:8080/events/{event.ID}/comments

![image](https://github.com/user-attachments/assets/9d7fdf2f-49ac-47c3-8104-35b23944a708)

**Sample Response**

![image](https://github.com/user-attachments/assets/a039ef5b-27d3-45d7-ac86-4195686667b8)


**7. CreateOrganizer API**

**Request Method:**
POST

**URL:**
localhost:8080/createOrganizer

![image](https://github.com/user-attachments/assets/2d9dcae7-4358-4e6f-bb04-8612d2214709)

**Sample Response**

![image](https://github.com/user-attachments/assets/0550833b-6d43-4aeb-97c5-54fff2c64518)


**8. DeleteOrganizer API**

**Request Method:**
DEL

**URL:**
localhost:8080/deleteOrganizer/{event.ID}

![image](https://github.com/user-attachments/assets/88dcec2c-1141-4a3c-8c32-0cd059d4efb0)

**Sample Response**

![image](https://github.com/user-attachments/assets/7d19e2ab-2a4f-4f77-8271-997b9c0f7f18)


**9. LoginOrganizer API**

**Request Method:**
POST

**URL:**
localhost:8080/loginOrganizer

![image](https://github.com/user-attachments/assets/e826592e-c3da-4dc3-82d1-fa26e6561afb)

**Sample Response**

![image](https://github.com/user-attachments/assets/1af6fdad-66f7-4e33-bf88-8ca65035c93c)


**10. AddUser API**

**Request Method:**
POST

**URL:**
http://localhost:8080/addUser

<img width="1028" alt="image" src="https://github.com/user-attachments/assets/2e3631b4-80eb-4adb-91fe-0f99d214835c" />

**Sample Response**

<img width="1035" alt="image" src="https://github.com/user-attachments/assets/72a43fc6-25e8-4b9d-8c88-ead2b54e695b" />


**11. GetUserByID API**

**Request Method:**
GET

**URL:**
http://localhost:8080/user/1

<img width="1026" alt="image" src="https://github.com/user-attachments/assets/37d3279d-42ad-4068-b239-cedb5e7b167a" />


**Sample Response**

<img width="1031" alt="image" src="https://github.com/user-attachments/assets/f65f4c02-49f0-4bbe-9de0-388d743805ba" />


**12. EditUser API**

**Request Method:**
PUT

**URL:**
http://localhost:8080/editUser/1

<img width="1032" alt="image" src="https://github.com/user-attachments/assets/de526034-3a37-4e2b-9c8a-295f2b3e1ed4" />


**Sample Response**

<img width="1032" alt="image" src="https://github.com/user-attachments/assets/c2c3f8cd-2377-4466-aefd-86806470398b" />


**13. RemoveUser API**

**Request Method:**
DELETE

**URL:**
http://localhost:8080/users/1

<img width="964" alt="image" src="https://github.com/user-attachments/assets/368ede5c-8bce-4a73-86fc-cd3f23ca1c3f" />


**Sample Response**

<img width="964" alt="image" src="https://github.com/user-attachments/assets/75052645-514a-4a1e-b735-7a20f0de72eb" />


**14. RegisterUser API**

**Request Method:**
POST

**URL:**
http://localhost:8080/register

<img width="1029" alt="image" src="https://github.com/user-attachments/assets/84ce6ecb-5c29-43d9-a507-5c9b9396c26c" />


**Sample Response**

<img width="1036" alt="image" src="https://github.com/user-attachments/assets/fc8754f7-bb83-4aa3-8493-68e121da9975" />

**15. LoginUser API**

**Request Method:**
POST

**URL:**
http://localhost:8080/LoginUser

<img width="1040" alt="image" src="https://github.com/user-attachments/assets/c0d7f6fe-d4a5-40bd-9173-bb38ad324898" />


**Sample Response**

<img width="1030" alt="image" src="https://github.com/user-attachments/assets/3d33dc72-46e3-41e1-9e6b-4b6f6227ac82" />


**16. LogoutUser API**

**Request Method:**
POST

**URL:**
http://localhost:8080/logout/2

<img width="1047" alt="image" src="https://github.com/user-attachments/assets/06ab33b9-0100-4d17-82b4-d965398f0598" />


**Sample Response**

<img width="1035" alt="image" src="https://github.com/user-attachments/assets/6053dd31-e29e-4bb2-bfc2-ff975ff0c4d8" />


**17. MapUserToEvent API**

**Request Method:**
POST

**URL:**
http://localhost:8080/mapUserToEvent

<img width="1034" alt="image" src="https://github.com/user-attachments/assets/2f9c1a5e-4972-4c07-b6ad-a236988f80e3" />


**Sample Response**

<img width="1049" alt="image" src="https://github.com/user-attachments/assets/0d27e1ef-52ba-4aee-88c7-0710869bc840" />


**18. GetRegisteredEvents API**

**Request Method:**
GET

**URL:**
http://localhost:8080/user/2/GetUserRegisteredEvents

<img width="1049" alt="image" src="https://github.com/user-attachments/assets/9857e6e7-ad94-4a5e-974f-ddac353420df" />


**Sample Response**

<img width="1056" alt="image" src="https://github.com/user-attachments/assets/452d97d3-5160-4b87-8bbc-1e923e92cd72" />


**19. UnmapUserFromEvent API**

**Request Method:**
POST

**URL:**
http://localhost:8080/unmapUserFromEvent

<img width="1009" alt="image" src="https://github.com/user-attachments/assets/ead74f4c-4546-4cf7-a0f9-613b6903358a" />


**Sample Response**

<img width="997" alt="image" src="https://github.com/user-attachments/assets/a9dd8a31-3b54-4961-b1cb-a89c699cbdbc" />


**20. GetAllComments API**

**Request Method:**
GET

**URL:**
http://localhost:8080/events/1/GetAllComments

<img width="1001" alt="image" src="https://github.com/user-attachments/assets/58dc5de9-c6bc-4265-b465-daa7b521ec73" />

**Sample Response**

<img width="1016" alt="image" src="https://github.com/user-attachments/assets/6bee2f81-6dfc-43e9-b487-0a5acbc2a5c1" />


**21. GetUsersByEvent API**

**Request Method:**
GET

**URL:**
http://localhost:8080/event/1/users

<img width="1012" alt="image" src="https://github.com/user-attachments/assets/fe040ecd-d826-4f6d-933d-a6ffe2afccef" />

**Sample Response**

<img width="1000" alt="image" src="https://github.com/user-attachments/assets/8ab4c3b1-74bd-4862-88ca-6669e97f3ebe" />

**22. Health Check API**

**Request Method:**
GET

**URL:**
http://localhost:8080/health

<img width="972" alt="image" src="https://github.com/user-attachments/assets/d02a9061-aaf3-4900-8796-1840e89685fb" />

**Sample Response**

<img width="963" alt="image" src="https://github.com/user-attachments/assets/cfe878b2-2315-49fc-95d7-acd9fea0e262" />


**23. Weather Forecast API**

**Request Method:**
GET

**URL:**
http://localhost:8080/event/18/weather

<img width="955" alt="image" src="https://github.com/user-attachments/assets/c0662d07-6e92-47be-8733-fc5f9d7cbc84" />

**Sample Response**

<img width="966" alt="image" src="https://github.com/user-attachments/assets/23291215-7220-4722-bda8-6fdc87835d63" />


<h3>Backend Unit Tests</h3>
<ul>
  <li>User API tests</li>
  <li>Event API tests</li>
  <li>Organizer API tests</li>
</ul>

<img width="881" alt="image" src="https://github.com/user-attachments/assets/136f751b-34be-4a60-926e-2a4c55f984b6" />
<img width="1081" alt="image" src="https://github.com/user-attachments/assets/514aa447-2a80-4b19-ae07-3b6ad1b0e170" />
<img width="962" alt="image" src="https://github.com/user-attachments/assets/94fe5b96-9bd2-4d2a-adb1-54ef33491890" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/df61a08f-260e-4098-86b4-257de99ddd14" />


**Running unit tests:**

cd backend/api/tests

go test -v


<h2>Sprint 4 Video Link</h2>
