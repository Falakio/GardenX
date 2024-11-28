# GEMS Garden - Hydroponic Vegetable Store

A web application for GEMS Our Own Indian School's hydroponic garden vegetable store. Students can browse and purchase fresh, organically grown vegetables from the school's garden.

## Features

- 🌱 Browse fresh, hydroponically grown vegetables
- 🛒 Easy shopping cart functionality
- 🔐 Secure authentication with email/password or Google
- 📱 Responsive design for all devices
- 👩‍💼 Admin panel for inventory and order management

## Tech Stack

- Frontend: React + Vite
- UI Framework: Material-UI
- Authentication & Database: Supabase
- State Management: React Context

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

## Environment Setup

1. Node.js 16+ and npm
2. Supabase account and project
3. Configure Google OAuth in Supabase dashboard (optional)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Main page components
├── contexts/      # React contexts
├── services/      # API and service functions
└── assets/        # Images and static files
```
