
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

![Netlify Environment Variables](https://docs.netlify.com/images/configure-builds/environment-variables.png)

4. After adding environment variables, trigger a new deployment

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the required environment variables mentioned above

## Deployment Steps for Netlify

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Netlify account
3. Click "New site from Git"
4. Select your repository and branch
5. Configure your build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. Once deployed, go to Site settings > Build & deploy > Environment
8. Add your environment variables:
   - VITE_GEMINI_API_KEY
   - VITE_CLERK_PUBLISHABLE_KEY
9. Trigger a new deployment

## Development

To run the project locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your API keys
4. Start the development server: `npm run dev`

## Features

- AI-powered resume analysis
- Resume building with templates
- Content improvement suggestions
- ATS optimization

## Security Notes

- API keys are never stored in the repository code
- API keys should always be set as environment variables in production
- Never hardcode API keys in your application files

