# Google Authorization Setup Guide

This guide details how to set up Google OAuth 2.0 authentication for the TripMind application.

## 1. Google Cloud Console Setup

To enable "Sign in with Google", you need to set up a project in the Google Cloud Console.

1.  **Go to Google Cloud Console:** [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Create a New Project:**
    *   Click on the project dropdown at the top left.
    *   Click "New Project".
    *   Name it "TripMind" (or your preferred name) and click "Create".
3.  **Configure OAuth Consent Screen:**
    *   Navigate to **APIs & Services > OAuth consent screen**.
    *   Select **External** user type and click "Create".
    *   Fill in:
        *   **App Name:** TripMind
        *   **User Support Email:** Your email
        *   **Developer Contact Information:** Your email
    *   Click "Save and Continue" through the scopes (default scopes `email`, `profile` and `openid` are sufficient).
4.  **Create Credentials:**
    *   Navigate to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
    *   **Application type:** Web application.
    *   **Name:** TripMind Web Client.
    *   **Authorized JavaScript origins:**
        *   `http://localhost:5173` (Frontend URL)
    *   **Authorized redirect URIs:**
        *   `http://localhost:5000/api/v1/auth/google/callback` (Backend Callback URL)
        *   *Note: Ensure this matches the `GOOGLE_CALLBACK_URL` in your `.env` file.*
    *   Click "Create".
5.  **Copy Credentials:**
    *   Copy the **Client ID** and **Client Secret**.

## 2. Backend Configuration

Update the environment variables in `services/api-service/.env.development` (or create a `.env` file).

```properties
# services/api-service/.env.development

# ... other config

# OAuth Credentials
GOOGLE_CLIENT_ID=your_copied_client_id_here
GOOGLE_CLIENT_SECRET=your_copied_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Implementation Details
*   **Strategy Config:** Located in `services/api-service/src/config/passportConfig.ts`.
*   **Routes:**
    *   `GET /auth/google`: Initiates the OAuth flow.
    *   `GET /auth/google/callback`: Handles the response from Google.
*   **Controller:** `authRoutes.ts` uses `passport.authenticate('google')`. On success, it redirects to the frontend with a token.

## 3. Frontend Configuration

No specific environment variables are needed for the frontend solely for the *link*, as the frontend simply redirects the user to the backend endpoint.

### Workflow
1.  **User clicks "Continue with Google"** on the Login/Signup page.
2.  Frontend redirects browser to `http://localhost:5000/api/v1/auth/google`.
3.  **User logs in** with their Google account on the Google consent screen.
4.  Google redirects back to `http://localhost:5000/api/v1/auth/google/callback` with a code.
5.  **Backend verifies code**, gets user profile, creates/logs in user, and generates a JWT.
6.  **Backend redirects** to `http://localhost:5173/auth/callback?token=...&user=...`.
7.  **Frontend `AuthCallback` component** captures the token from the URL, saves it to storage, and redirects to Home.

## 4. Testing

1.  Ensure backend and frontend are running.
2.  Go to `http://localhost:5173/login`.
3.  Click the "Continue with Google" button.
4.  You should be redirected to Google, sign in, and then redirected back to the TripMind home page as a logged-in user.

## Troubleshooting

*   **`redirect_uri_mismatch` error:**
    *   Check that the URI in the Google Cloud Console exactly matches `GOOGLE_CALLBACK_URL` in `.env`.
    *   Ensure there are no trailing slashes or protocol mismatches (http vs https).
*   **"Google OAuth credentials not configured" warning in server logs:**
    *   Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in the `.env` file loaded by the server.
*   **Frontend 404 on callback:**
    *   Ensure the redirect URL in `authRoutes.ts` matches your frontend route (currently `/auth/callback`).
