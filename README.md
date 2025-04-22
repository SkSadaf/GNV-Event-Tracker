# GNV-Event-Tracker

# Project description
<p align='justify'>
  This project is for CEN5035 (Software Engineering). 
  It is a platform where you can find local events happening around the city. Users can register, login, find all events happening in Gainesville, view event details, register for events, get notified when new events are posted, book tickets, comment on event pages, plan their itineraries, view all their registered events, create new events, view events on a map, and unregister for events if they can't make it.
</p>
<img width="939" alt="image" src="https://github.com/user-attachments/assets/397ee704-e062-4caa-8590-2607ea7a9d08" />


# Team Members
- **Sadaf Tabassum Shaik** (UFID: 88489948) - Frontend
- **Sparsh Rathi** (UFID: 34225674) - Frontend
- **Rishma Manna** (UFID: 53560448) - Backend
- **Aria Yousefi** (UFID: 27514943) - Backend


# Tech Stack
## Frontend
1. **React version:** react@18.2.0
2. **Cypress version:** cypress@14.0.2
3. **Jest version:** jest@27.5.1

## Backend
1. **Go version:** go1.23.3 darwin/amd64
2. **SQLite version:** 3.46.1

# Execution Commands
## Frontend
1. cd Frontend\gnv-event-tracker
3. npm start
## Frontend Tests
### Unit tests
1. cd Frontend\gnv-event-tracker
2. npm test testname.test.js
### Cypress e2e tests
1. cd Frontend
2. npx cypress open
3. Go to the e2e testing upon cypress window opening
4. Click on the test you want to run

## Backend server
1. cd backend/
2. go run main.go
## Backend Tests
1. cd backend/api/tests
2. go test -v
