# HomeMaxx Dialer System

This is a complete dialer system for real estate lead management, integrating Google Sheets, Twilio Voice, and React.

## Project Structure

```
windsurf-project/
├── backend/           # Express API server
│   ├── server.js
│   └── package.json
├── frontend/          # React client app
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeadDashboard.js
│   │   │   └── CallInterface.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── functions/         # Firebase Cloud Functions (API)
│   ├── index.js
│   └── package.json
├── .gitignore
├── firebase.json
├── .firebaserc
└── .env               # root .env used by both backend and frontend
```

## Prerequisites

- Node.js (>=14)
- npm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud Service Account JSON credentials
- Twilio account (Account SID, Auth Token, From & Agent phone numbers)
- OpenAI API key (for email generation)

## Setup Instructions

### 1. Clone the repository
```bash
# Assuming you are in desired parent directory
git clone <repo_url> windsurf-project
cd windsurf-project
```

### 2. Configure Google Sheets API
1. Create a Google Cloud service account with **Editor** access.
2. Enable the Google Sheets API.
3. Download the JSON key file and rename it to `google-credentials.json`.
4. Share your target Google Sheets with the service account email.

### 3. Backend Configuration
```bash
cd backend
npm install        # installs dependencies and loads env from root /.env
```

### 4. Frontend Configuration
```bash
cd frontend
npm install       # installs dependencies and uses prestart to load env from root /.env
```

### 5. Configure Email Automation

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add the following to your `.env` file:

```
OPENAI_API_KEY=your_openai_api_key
EMAIL_FROM=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

### 6. Run Locally
```bash
# From project root

# Start backend server (port 5000)
npm --prefix backend start

# Start frontend app (port 3000)
npm --prefix frontend start

# (Optional) run both in one command:
npx concurrently "npm --prefix backend start" "npm --prefix frontend start"
```
Open http://localhost:3000 in your browser.

## Deployment with Firebase Hosting & Functions
```bash
# Build React app
cd frontend
npm run build

# Deploy to Firebase
cd ..
firebase login
firebase init      # select Hosting and Functions, choose existing project or create one
# Ensure firebase.json and .firebaserc are set
firebase functions:config:set \
  sheets.id="<SHEET_ID>" \
  sheets.email="<SERVICE_ACCOUNT_EMAIL>" \
  sheets.private_key="$(printf "%s" "<PRIVATE_KEY>" | sed 's/$/\\n/g')" \
  twilio.sid="<TWILIO_ACCOUNT_SID>" \
  twilio.token="<TWILIO_AUTH_TOKEN>" \
  twilio.from="<TWILIO_PHONE_NUMBER>" \
  twilio.agent="<AGENT_PHONE_NUMBER>"

firebase deploy
```

## User Guide
- **Lead Dashboard**: View leads, filter by call status, see metrics.
- **One-Click Call**: Click **Call** next to a lead to initiate a call.
- **Call Interface**: During call, view script, timer, add notes, select outcome.
- **Complete Call**: Click **Complete Call** to save status and notes back to Google Sheets.

## Email Automation Features

The system now includes AI-powered email automation with the following features:

### Generate Personalized Emails
- Automatically generate personalized emails based on lead type (buyer, seller, foreclosure, etc.)
- Uses conversation notes for context-aware email generation
- Multiple email templates for different scenarios

### How to Use Email Features
1. In the Call Interface, click "Generate Email" when viewing a lead with an email address
2. Select the email type from the dropdown
3. Review the generated email
4. Click "Send Email" to send or "Regenerate" to create a new version

### Email Templates
- **Follow-up**: For general follow-up after a call
- **Property Information**: For sending property details
- **Schedule Appointment**: For scheduling property viewings
- **Custom**: Custom email content

### Email Security
- All emails are sent through a secure connection
- Email credentials are stored securely in environment variables
- Rate limiting is implemented to prevent abuse

## Features

- View and filter leads from Google Sheets
- One-click calling via Twilio
- Call outcome tracking
- Real-time metrics dashboard
- AI-powered email automation
- Multiple email templates
- Conversation-aware email generation

## Troubleshooting
- **Permission Errors**: Ensure Google Sheet is shared with service account.
- **Twilio Errors**: Verify credentials and phone numbers in `.env`.
- **CORS Issues**: Confirm proxy or `REACT_APP_API_URL` is correct.
# dialer
