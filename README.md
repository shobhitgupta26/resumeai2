
# ResumeAI - AI-Powered Resume Builder

ResumeAI is a modern web application that helps users create and analyze resumes using AI technology.

## Environment Variables

This project uses environment variables to store sensitive information like API keys. When deploying, make sure to set the following environment variables:

### Required Environment Variables

- `VITE_GEMINI_API_KEY` - Your Google Gemini API key
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key

### Setting Environment Variables

#### For Local Development:

Create a `.env.local` file in the root directory:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

Note: The `.env.local` file is included in `.gitignore` to prevent sensitive information from being committed to your repository.

#### For Netlify Deployment:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Build & deploy > Environment
3. Add the required environment variables mentioned above

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the required environment variables mentioned above

## Development

To run the project locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your API keys
4. Start the development server: `npm run dev`

## Deployment

This project can be easily deployed to Netlify, Vercel, or any other static site hosting platform that supports environment variables.

## Features

- AI-powered resume analysis
- Resume building with templates
- Content improvement suggestions
- ATS optimization

## Security Notes

- API keys are never stored in the repository code
- For local development, API keys can be temporarily stored in browser localStorage
- In production, API keys should always be set as environment variables
