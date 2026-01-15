const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

// This object stores the latest sensor states in memory
let sensorData = {};

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint for the Raspberry Pi to send data to
app.post('/update', (req, res) => {
    const { pin, name, status } = req.body;
    
    sensorData[pin] = {
        name: name,
        status: status,
        time: new Date().toLocaleTimeString()
    };

    console.log(`Update from Pi: ${name} is ${status}`);
    res.status(200).send({ message: "Data received" });
});

// API for the HTML page to fetch the current status
app.get('/status', (req, res) => {
    res.json(sensorData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));