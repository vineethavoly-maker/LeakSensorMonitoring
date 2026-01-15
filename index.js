const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());

// --- CONFIGURATION ---
// IMPORTANT: Subscribe to this same name in the ntfy app on your phone
const NTFY_TOPIC = 'vinee_secure_system_7788'; 
let sensorData = {};

// 1. Serve the dashboard HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Receive data from Raspberry Pi
app.post('/update', (req, res) => {
    const { pin, name, status } = req.body;
    const previousStatus = sensorData[pin] ? sensorData[pin].status : 'OFF';

    sensorData[pin] = {
        name: name,
        status: status, // "ON" = Leak, "OFF" = Dry
        time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Trigger phone alert only when status flips to "ON"
    if (status === 'ON' && previousStatus !== 'ON') {
        sendPushNotification(name);
    }

    res.status(200).send({ success: true });
});

// 3. Status API for the HTML Dashboard
app.get('/status', (req, res) => {
    res.json(sensorData);
});

async function sendPushNotification(location) {
    try {
        await axios.post(`https://ntfy.sh/${NTFY_TOPIC}`, 
            `🚨 ALERT: Water detected at ${location}!`, 
            {
                headers: {
                    'Title': 'Vinee Secure Alert',
                    'Priority': '5', // Max priority (loud alert)
                    'Tags': 'warning,droplet'
                }
            }
        );
        console.log("Push notification sent.");
    } catch (error) {
        console.error("Notification Error:", error.message);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));