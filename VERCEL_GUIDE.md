# Deploying MadJock Backend to Vercel

This guide explains how to deploy the MadJock backend to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Vercel CLI** (Optional): Install via `npm i -g vercel`.
3.  **GitHub Repository**: Push your code to a GitHub repository.

## Deployment Steps

### Method 1: GitHub Integration (Recommended)

1.  Push your code to GitHub.
2.  Log in to Vercel and click **Add New Project**.
3.  Import your GitHub repository.
4.  Wait for Vercel to detect the project settings. It should automatically detect `server.js` or `package.json`.
5.  **Environment Variables**:
    - Go to **Settings** > **Environment Variables**.
    - Add all variables from your `.env` file:
        - `MONGO_URI`
        - `JWT_SECRET`
        - `AWS_ACCESS_KEY`
        - `AWS_SECRET_KEY`
        - `AWS_REGION`
        - `S3_BUCKET`
        - `DRAFT4SMS_API_KEY`
        - `DRAFT4SMS_SENDER_ID`
        - `DRAFT4SMS_TEMPLATE_ID`
        - `NODE_ENV` (set to `production`)
6.  Click **Deploy**.

### Method 2: Vercel CLI

1.  Run `vercel login` in your terminal.
2.  Run `vercel` in the project root directory.
3.  Follow the prompts:
    - Set up and deploy? [Y/n] `y`
    - Which scope? (Select your team/user)
    - Link to existing project? [N/y] `n`
    - Project name? `madjock-backend`
    - Directory? `./`
4.  Add environment variables via the dashboard or CLI (`vercel env add VAR_NAME`).
5.  Run `vercel --prod` to deploy to production.

## Configuration

The project includes a `vercel.json` file configured for Express apps:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

This tells Vercel to use `server.js` as the entry point for all requests.

## Troubleshooting

-   **Cold Starts**: Serverless functions may have a slight delay on the first request after inactivity.
-   **Database Connections**: Ensure your MongoDB connection string allows access from anywhere (`0.0.0.0/0`) or whitelist Vercel IP ranges (using Atlas Network Access).
-   **File Uploads**: Ensure `multer-s3` is working correctly. Vercel's ephemeral file system is read-only except for `/tmp`, but we are streaming directly to S3, so it should work fine.

## API URL

After deployment, your API base URL will be:
`https://your-project-name.vercel.app`
