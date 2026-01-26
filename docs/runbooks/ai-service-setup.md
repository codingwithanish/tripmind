# AI Service Setup & Google API Key

This runbook details the steps to obtain a Google API Key and configure the AI Service for TripMind.

## 1. Prerequisites

- A Google Account.
- Access to [Google AI Studio](https://aistudio.google.com/).

## 2. Generate Google API Key

The AI Service uses Gemini models via the Google AI SDK, which requires a valid API Key.

1.  **Navigate to Google AI Studio:**
    - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

2.  **Create API Key:**
    - Click **Create API key**.
    - You can choose to **Create API key in a new project** or use an existing Google Cloud project.
    - Copy the generated API key string.

## 3. Configure AI Service

1.  **Locate the AI Service Directory:**
    - Navigate to `services/ai-service`.

2.  **Setup Environment Variables:**
    - Create a `.env` file from the example:
      ```bash
      cp .env.example .env
      ```
      *(Or manually create a file named `.env`)*

    - Open `.env` and paste your API key:
      ```properties
      # services/ai-service/.env

      # Google AI API Key (required for Gemini models)
      GOOGLE_API_KEY=AIzaSy...YourKeyHere...

      # Model Configuration (Optional)
      DEFAULT_MODEL=gemini-2.0-flash
      ```

## 4. Verification

To verify the setup is working correctly, you can use the verification script provided in the project root.

1.  **Ensure AI Service is Running:**
    ```bash
    # In services/ai-service
    npm run dev
    # OR if using Python directly
    python src/main.py
    ```

2.  **Run Verification Script:**
    From the root of the workspace (`d:\Workspace\Personal\tripmind`):
    ```bash
    node verify_ai.js
    ```

    **Expected Output:**
    You should see a JSON response containing travel suggestions, indicating the agent successfully communicated with the Gemini API.

3.  **Manual Test (cURL):**
    ```bash
    curl -X POST http://localhost:8001/api/v1/execute \
         -H "Content-Type: application/json" \
         -d '{"agent": "suggestion_agent", "input": {"location": "Paris", "screen_type": "mobile"}}'
    ```

## Troubleshooting

-   **Quota Exceeded:** If you receive 429 errors, you may have exceeded the free tier quota for Gemini API.
-   **Invalid Key:** Ensure there are no extra spaces around the key in the `.env` file.
-   **Region Restrictions:** Some models may not be available in all regions.
