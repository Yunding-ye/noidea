# Manipulative Language Checker

A full-stack web app that analyzes text for potential manipulative language patterns using React, Express, and the OpenAI API.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a file named `.env` in the project root.
3. Put this line inside `.env`:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start frontend and backend together:
   ```bash
   npm run dev:all
   ```
5. Open the frontend at:
   http://localhost:5173
6. The backend runs at:
   http://localhost:3001

## API

- `POST /api/analyze`
- Body:
  ```json
  {
    "text": "Your message here"
  }
  ```
