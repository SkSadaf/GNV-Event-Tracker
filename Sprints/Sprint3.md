<h1>Sprint 3 Report</h1>

<h2>Tasks Completed During Sprint 3</h2>
<ul>
  <li>Integrated backend and frontend for Interactive Map view, User Profile, Individual Event Page functionalities, and Creating Events</li>
  <li>Created backend APIs and unit tests</li>
  <li>Implemented cypress tests for frontend</li>
  <li>Enriched web scraping capabilities with additional functionalities for collecting event data</li>
</ul>
<h2>Frontend</h2>

<h3>Tasks Completed</h3>
<ul>
  <li>Created Map Page</li>
  <li>Integrated Map Page functionality with backend api</li>
  <li>Changed register button to already registered if the user is registered</li>
  <li>Added comment section functionality in each events page</li>
  <li>Implemented cypress Test for MapPage</li>
  <li>Implemented cypress test for individual event details page</li>
  <li>Implemented unregister functionality from event button on dashboard</li>
  <li>Made the Logged in pages not visible without user logging in </li>
  <li>Routing to signup page after signing out</li>
  <li>Addeded a feature to display the count of people going to the event in each event's page</li>
  <li>Added cypress unit test for sign up page routing</li>
  <li>Implemented create event functionality</li>
  <li>Implement cypress unit test for create event functionality</li>
  <li>Integrated Logout in user profile section</li>
  <li>Added view Profile, Edit Profile, Delete Profile features in the profile section</li>
  <li>Integrated profile section functionality with backend api</li>
</ul>

<h3>List unit tests and Cypress test for frontend</h3>

<h4>Unit tests:</h4>
<ul>
<li><b>Login</b></li>

![login test](https://github.com/user-attachments/assets/e0a205aa-ab37-4935-86da-786340186a93)
  
<li><b>Signup</b></li>

![signup test](https://github.com/user-attachments/assets/f6032a07-99e7-4b2e-9fa7-43d3feec4ed8)

<li><b>Create Event</b></li>

![createevent test](https://github.com/user-attachments/assets/fbe7b8f4-c6a1-497f-af4d-bbe6f4491e61)
</ul>

<h4>Cypress e2e tests:</h4>
<ul>
<li><b>Homepage</b></li>
  
![homepage test](https://github.com/user-attachments/assets/c617d1e0-d906-427e-a3c1-72669014511e)
  
<li><b>Dashboard</b></li>

![dashboard test](https://github.com/user-attachments/assets/c66f69c7-af6a-4eb2-acf8-d5e13a424acc)

<li><b>All Events page</b></li>

![allevents test](https://github.com/user-attachments/assets/5f0e1e32-f38b-42e8-9a17-ea33483d3110)

<li><b>Map page</b></li>

![mappage test](https://github.com/user-attachments/assets/9212b306-28ad-4778-9032-97163b2e17bc)

<li><b>Event Details Page</b></li>

![eventdetails test](https://github.com/user-attachments/assets/572e3ba6-c7d7-4a42-bd3c-ba2dcb163fe5)
</ul>

**Running cypress tests:**

cd Frontend

npx cypress open

<h2>Backend</h2>

<h3>Tasks Completed</h3>
<ul>
  <li>Added latitude and longitude values from scraper and user-created events</li>
  <li>Created APIs for unmap user from event, get all comments, and get user list for an event</li>
  <li>Created Go Unit tests added for new APIs and verified for existing APIs</li>
  <li>Modified Create Event to handle user-created events and saved user details as organizer in DB once user creates an event</li>
  <li>Added organizer details object and organizer ID for each event</li>
  <li>Modified scraper to run after server start</li>
  <li>Added additional required columns Events and Comment DB</li>
  <li>Modified tags datatype and date time formatting in DB while creating event</li>
  
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

<img width="1033" alt="image" src="https://github.com/user-attachments/assets/4da27ada-333d-4cc9-9396-3f78fa35d469" />


**Sample Response**

<img width="1026" alt="image" src="https://github.com/user-attachments/assets/125e8f0c-9711-4d26-b5f0-deb9fac08d9e" />


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

<h3>Backend Unit Tests</h3>
<ul>
  <li>User API tests</li>
  <li>Event API tests</li>
  <li>Organizer API tests</li>
</ul>

<img width="1089" alt="image" src="https://github.com/user-attachments/assets/edc382be-3a6c-49a6-8be6-3b62bf6f933e" />

<img width="875" alt="image" src="https://github.com/user-attachments/assets/646a6f3a-c374-4c08-a321-e11efcc161d1" />

<img width="802" alt="image" src="https://github.com/user-attachments/assets/a68b66c0-0fbe-4bdc-b7cf-a28f641aa636" />



**Running unit tests:**

cd backend/api/tests

go test -v


<h2>Sprint 3 Video Link</h2>
