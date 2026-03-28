# KanbanApp

A Trello-like Kanban project management application built with Node.js, Express, Prisma (SQLite), React, and Tailwind CSS.

## Features

- 📋 Multiple boards with custom colors
- 📝 Lists with drag-and-drop reordering
- 🃏 Cards with drag-and-drop between lists
- 🏷️ Labels for card categorization
- 👥 Member assignment to cards
- ✅ Checklists with progress tracking
- 📅 Due dates with overdue indicators
- 🔍 Search and filter cards

## Tech Stack

**Backend:** Node.js, Express.js, Prisma ORM, SQLite  
**Frontend:** React, Vite, Tailwind CSS, dnd-kit, Axios

## Getting Started

### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The backend runs on http://localhost:5000 and the frontend on http://localhost:5173.
