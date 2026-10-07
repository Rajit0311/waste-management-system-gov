# CleanCity – Waste Management (MERN)

## Run it
1. Install MongoDB locally (or use a free MongoDB Atlas URI).
2. Backend:
   cd server && cp .env.example .env   # edit JWT_SECRET, admin email/password
   npm install && npm run seed && npm run dev
3. Frontend (new terminal):
   cd client && npm install && npm run dev
4. Open http://localhost:5173

## Accounts
- Citizens: /signup
- Admin: /admin/login (created by `npm run seed`)
- Employees: added by the admin on the dashboard, then log in at /login

## Flow
Citizen reports (photo + GPS) -> Admin sees it as "Waiting" -> assigns an employee ->
Employee starts work and marks it cleaned -> Citizen sees the status update.

Note: GPS and camera need https or localhost in the browser.
