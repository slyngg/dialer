require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const twilio = require('twilio');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google Sheets
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function initGoogleSheets() {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    console.log('Google Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
}

// Initialize Google Sheets on startup
initGoogleSheets().catch(console.error);

// API Routes
app.get('/api/leads', async (req, res) => {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const leads = rows.map(row => ({
      id: row.id || row._rowNumber,
      name: row.name,
      phone: row.phone,
      email: row.email,
      status: row.status || 'New',
      lastContact: row.lastContact,
    }));
    
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const lead = rows.find(row => (row.id || row._rowNumber).toString() === req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({
      id: lead.id || lead._rowNumber,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      status: lead.status || 'New',
      lastContact: lead.lastContact,
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead details' });
  }
});

app.post('/api/calls/start', async (req, res) => {
  try {
    const { leadId } = req.body;
    
    // Get lead details
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const lead = rows.find(row => (row.id || row._rowNumber).toString() === leadId);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Initiate Twilio call
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL}/api/calls/twiml`,
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    res.json({ callSid: call.sid });
  } catch (error) {
    console.error('Error starting call:', error);
    res.status(500).json({ error: 'Failed to start call' });
  }
});

app.post('/api/calls/end', async (req, res) => {
  try {
    const { leadId, notes, duration } = req.body;
    
    // Update lead in Google Sheets
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const lead = rows.find(row => (row.id || row._rowNumber).toString() === leadId);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    lead.status = 'Contacted';
    lead.lastContact = new Date().toISOString();
    lead.notes = notes;
    await lead.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});