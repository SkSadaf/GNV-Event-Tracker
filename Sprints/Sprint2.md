<h1>Sprint 2 Report</h1>

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
![login gif](https://github.com/user-attachments/assets/01994aad-01a1-4fb1-82bb-25c83cfb1fa0)
  
<li>SignUp page</li>
![signup gif](https://github.com/user-attachments/assets/a5509424-530f-46bb-8bfc-89ece520d0e8)
</ul>

<h4>Cypress e2e tests:</h4>
<ul>
<li>Homepage</li>
![homepage gif](https://github.com/user-attachments/assets/8e5b41c1-9903-42a2-b742-1c74602569a0)
  
<li>Dashboard</li>
![dashboard gif](https://github.com/user-attachments/assets/454370c9-56e1-4354-9054-40b6b7be14bf)

<li>All Events page</li>
![allevents gif](https://github.com/user-attachments/assets/a9ca3ee2-21aa-45f0-86ef-cda229ae9b21)
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

<h3>Backend API Documentation</h3>

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


<h2>Sprint 2 Video Link</h2>

[GNV Event Tracker Sprint 2 Video](https://drive.google.com/file/d/1i5x6FthFGpoSlJwf9lf73ehOoZy7Kqya/view?usp=sharing)
