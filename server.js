/**
 * BACKEND SERVER (Node.js / Express)
 * 
 * Instructions:
 * 1. Install dependencies: npm install express cors googleapis body-parser
 * 2. Set Env Var: GOOGLE_APPLICATION_CREDENTIALS_JSON='{...}'
 * 3. Run server: node server.js
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
// Replace this with your specific Spreadsheet ID after creating the sheet once
// If you don't have one, the server will error on write but stay alive.
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; 

// --- SECURITY: LOAD CREDENTIALS FROM ENVIRONMENT VARIABLE ---
let sheets = null;

function initializeGoogleSheets() {
    try {
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        throw new Error("Missing environment variable: GOOGLE_APPLICATION_CREDENTIALS_JSON");
      }
      const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      
      const jwtClient = new google.auth.JWT(
        SERVICE_ACCOUNT.client_email,
        null,
        SERVICE_ACCOUNT.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      
      sheets = google.sheets({ version: 'v4', auth: jwtClient });
      console.log("Successfully loaded Service Account credentials.");
    } catch (error) {
      console.error("\n[WARNING] Google Sheets Auth Failed:", error.message);
      console.error("Server will start in Offline Mode (API will return 500s for Sheet operations).\n");
      // We do NOT exit, so the server port stays open
    }
}

initializeGoogleSheets();

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.send('ChemStock Backend is running.');
});

// 1. Get All Data (Transactions & Products)
app.get('/api/data', async (req, res) => {
    if (!sheets) return res.status(503).json({ error: "Server not authenticated with Google" });

    try {
        // Read Transactions
        const txRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Transactions!A2:L',
        });
        
        // Read Products
        const prodRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Products!A2:H',
        });

        res.json({
            transactions: txRes.data.values || [],
            products: prodRes.data.values || []
        });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        // If sheet doesn't exist yet, return empty arrays instead of error
        res.json({ transactions: [], products: [] });
    }
});

// 2. Append Transaction (POST)
app.post('/api/transactions', async (req, res) => {
    if (!sheets) return res.status(503).json({ error: "Server not authenticated with Google" });

    try {
        const { date, type, ref, pid, lot, qty, loc, status, user, mfg, exp, sup } = req.body;
        
        const row = [
            new Date().toISOString(), // ID (timestamp)
            date, type, ref, pid, lot, qty, loc, status, user, 
            mfg || '', exp || '', sup || ''
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Transactions!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row]
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error appending transaction:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 3. Append Product (POST)
app.post('/api/products', async (req, res) => {
    if (!sheets) return res.status(503).json({ error: "Server not authenticated with Google" });

    try {
        const p = req.body;
        const row = [p.id, p.sku, p.tradeName, p.type, p.baseUnit, p.minStockLevel, p.inciName, p.casNumber];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Products!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row]
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error appending product:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Server running on port ${PORT} (0.0.0.0)`);
});