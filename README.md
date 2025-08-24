# SyncCal - Student Assignment Management System

A comprehensive web application designed to help students manage their academic assignments, tests, and schedules with seamless calendar integration.

## Features

- **Assignment Management**: Create, track, and organize assignments with priority levels and progress tracking
- **Calendar Integration**: Visual calendar view with due dates and assignment details
- **Spreadsheet Import**: Bulk import assignments from Excel or CSV files
- **Multi-User Support**: Simple user switching between Zoo and Nish
- **Subject Organization**: Color-coded subjects with teacher information
- **Material Design UI**: Clean, responsive interface following Material Design principles

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with Material Design colors
- **Radix UI** components with shadcn/ui
- **TanStack Query** for state management
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **Multer** for file uploads
- **XLSX** for spreadsheet parsing

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   - PostgreSQL database is configured via environment variables
   - Drizzle ORM handles schema management

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open your browser to the development URL
   - Use the simple user switcher to select between Zoo and Nish

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configuration
├── server/
│   ├── index.ts            # Express server setup
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── db.ts              # Database configuration
├── shared/
│   └── schema.ts           # Shared TypeScript types
└── replit.md              # Project documentation
```

## Usage

### Adding Assignments
1. Use the floating action button to create individual assignments
2. Or import bulk assignments via spreadsheet upload

### Spreadsheet Import
Supported formats: Excel (.xlsx, .xls) and CSV files

Required columns:
- **Title/Assignment**: Assignment name
- **Subject/Class**: Course subject
- **Due Date**: Assignment due date

Optional columns:
- **Description**: Assignment details
- **Priority**: low, medium, or high
- **Teacher**: Instructor name
- **Status**: pending, in-progress, or completed

### Calendar View
- Navigate between months
- Click on dates to view assignments
- Color-coded by subject
- Shows up to 3 assignments per day with overflow indicator

## Development

The application uses a modern full-stack architecture with:
- Hot reloading during development
- Type safety across frontend and backend
- Responsive design for desktop and mobile
- Material Design principles for consistent UI

## Database Schema

- **Users**: Multi-user support with profile information
- **Assignments**: Core assignment data with relationships
- **Subjects**: Course subjects with color coding
- **Upload Logs**: Track spreadsheet import history

## Contributing

This is a student project focused on academic productivity and assignment management.
