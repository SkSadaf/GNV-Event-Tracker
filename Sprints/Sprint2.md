<h1>Sprint 2</h1>

<h2>Tasks Completed During Sprint 2</h2>
<ul>
  <li>Integrated backend and frontend</li>
  <li>Wrote backend API unit tests</li>
  <li>Implemented Cypress tests for frontend</li>
  <li>Developed a web scraper for collecting event data</li>
</ul>
<h2>Frontend</h2>

<h3>Tasks Completed</h3>
<ul>
  <li>Integrated SignUp Functionality with Go Backend API</li>
  <li>Integrated Login Functionality with Go Backend API</li>
  <li>Created Dashboard Page</li>
  <li>Created All Events page</li>
  <li>Created page for each event</li>
  <li>Implemented logout functionality</li>
  <li>Implemented Event Registration functionality</li>
  <li>Integrated All Events Display with Go Backend API</li>
  <li>Integrated Dashboard functionality with Go Backend API</li>
  <li>Implemented Cypress Tests for SignUp Page</li>
  <li>Implemented Cypress Tests for LoginPage</li>
  <li>Implemented Cypress Tests for Homepage</li>
  <li>Implemented Cypress tests for Dashboard</li>
  <li>Implemented Cypress Tests for All Events page</li>
  <li>Integrated Logout functionality with Go Backend API</li>
</ul>

<h3>List unit tests and Cypress test for frontend</h3>

<h4>Unit tests:</h4>
<ul>
<li>Login page</li>
<li>SignUp page</li>
</ul>

<h4>Cypress e2e tests:</h4>
<ul>
<li>Homepage</li>
<li>Dashboard</li>
<li>All Events page</li>
</ul>

<h2>Backend</h2>

<h3>Tasks Completed</h3>
<ul>
  <li>Created initial version of web scraper for collecting event data</li>
  <li>Created an Organizer object and API for users who create events</li>
  <li>Created Go Unit tests for user, events, and organizer APIs</li>
  <li>Created APIs for Get event details by event ID, Get all registered events for user, map/register user to event, Add Organizer, Delete Organizer, Login Organizer, Add comment to event, and Logout user</li>
  <li>Add additional required columns to Users and Events DB, User-Event DB mapping, Event-organizer and Event-organizerID DB mapping</li>
  
</ul>

<h3>API Documentation</h3>

**1. CreateEvent API**

**Request Method:**
POST

**URL:**
localhost:8080/CreateEvent

![image](https://github.com/user-attachments/assets/05e52de7-9853-4be7-8eac-06aafe3bb830)

**Sample Response**

![image](https://github.com/user-attachments/assets/8b9f02f4-d877-4857-8192-baedaa60bc14)

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

![image](https://github.com/user-attachments/assets/cff6766d-c193-4f3f-a6a5-cb85f2b33210)

**Sample Response**

![image](https://github.com/user-attachments/assets/e8ff8c7b-9bf9-423c-b153-3690feb57ae0)

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

<h3>Backend Unit Tests</h3>
<ul>
  <li>User API tests</li>
  <li>Event API tests</li>
  <li>Organizer API tests</li>
</ul>

![image](https://github.com/user-attachments/assets/d63a3dd2-ba3c-4303-80c2-e3f8a88ecac4)

![image](https://github.com/user-attachments/assets/6db10fc4-568d-4c7b-98d3-be8388c76bda)

![image](https://github.com/user-attachments/assets/1fa056e5-cbcf-4912-9951-e22f545e387c)



**Running unit tests:**

cd backend/api/tests

go test -v


