const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

// Variable to store the current status of Pin 18
let pinStatus = "OFF";

// 1. Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Endpoint for the Raspberry Pi to UPDATE status
app.post('/update', (req, res) => {
    pinStatus = req.body.status || "OFF";
    console.log("Received update from Pi:", pinStatus);
    res.sendStatus(200);
});

// 3. Endpoint for the Webpage to GET status (Used by HTMX)
app.get('/status', (req, res) => {
    const color = pinStatus === "ON" ? "#4CAF50" : "#f44336";
    // Returns a small chunk of HTML for the frontend to swap in
    res.send(`<div id="status-display" style="background:${color}; color:white; padding:20px; border-radius:10px; font-size:40px;">
                ${pinStatus}
              </div>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));