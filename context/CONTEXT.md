# Project Context

## Project Overview
This project is a dungeon crawler application designed to provide an engaging experience for players and dungeon masters (DMs). It includes features such as player management, game creation, and inventory handling.

## Architecture
- **Frontend**: Built with Next.js, utilizing React components for UI.
- **Backend**: Supabase is used for database and authentication.
- **State Management**: Context API and hooks are used for managing state.
- **Styling**: Tailwind CSS is used for styling components.

## Coding Standards
- Follow TypeScript best practices.
- Use camelCase for variable and function names.
- Write clear and concise comments for complex logic.
- Ensure all functions are covered by unit tests.

## Rules and Best Practices
- Always validate user input on both client and server sides.
- Use environment variables for sensitive data.
- Avoid hardcoding values; use constants or configuration files.
- Ensure all API calls handle errors gracefully.

## Dependencies
- **Next.js**: Framework for building the application.
- **Supabase**: Backend as a service for database and authentication.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **TypeScript**: For type safety and better developer experience.

## Database
- Reference `migration.sql` for the entire database structure. Make adjustments to this table as you see fit.