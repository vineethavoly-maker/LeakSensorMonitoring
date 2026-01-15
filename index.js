const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());

const NTFY_TOPIC = 'vinee_secure_system_7788'; 
let sensorData = {}; 
let sensorList = {}; 

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- SYNC LOGIC: Handles Add, Rename, and DELETE ---
app.post('/sync', (req, res) => {
    const newList = req.body;
    
    // Cleanup: If a pin exists in status data but NOT in the new list, delete its status
    for (const pin in sensorData) {
        if (!newList[pin]) {
            delete sensorData[pin];
        }
    }
    
    sensorList = newList; 
    console.log("Cloud Synced. Current Sensors:", sensorList);
    res.sendStatus(200);
});

app.post('/update', (req, res) => {
    const { pin, name, status } = req.body;
    const prev = sensorData[pin] ? sensorData[pin].status : 'OFF';

    sensorData[pin] = {
        status: status,
        time: new Date().toLocaleTimeString()
    };

    if (status === 'ON' && prev !== 'ON') {
        sendPushNotification(name || `Pin ${pin}`);
    }
    res.sendStatus(200);
});

app.get('/status', (req, res) => {
    let combined = {};
    for (const pin in sensorList) {
        combined[pin] = {
            name: sensorList[pin],
            status: sensorData[pin] ? sensorData[pin].status : 'OFF',
            time: sensorData[pin] ? sensorData[pin].time : 'Waiting...'
        };
    }
    res.json(combined);
});

async function sendPushNotification(location) {
    try {
        await axios.post(`https://ntfy.sh/${NTFY_TOPIC}`, 
            `🚨 ALERT: Leak detected at ${location}!`, 
            { headers: { 'Title': 'Vinee Secure Alert', 'Priority': '5' } }
        );
    } catch (e) { console.error("Notify failed"); }
}


app.listen(process.env.PORT || 3000);
