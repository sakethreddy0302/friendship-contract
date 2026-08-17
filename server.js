const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const EXCEL_FILE = path.join(__dirname, 'responses.xlsx');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Email Transporter
// (For Gmail, use an App Password: https://myaccount.google.com/apppasswords)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com', // ****** YOUR GMAIL ADDRESS ******
        pass: 'YOUR_GMAIL_APP_PASSWORD' // ****** YOUR GMAIL APP PASSWORD ******
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/submit', async (req, res) => {
    try {
        const responseData = req.body;
        responseData.timestamp = new Date().toLocaleString();

        // 1. Save to Excel locally on server
        let workbook;
        let worksheet;
        if (fs.existsSync(EXCEL_FILE)) {
            workbook = XLSX.readFile(EXCEL_FILE);
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const existingData = XLSX.utils.sheet_to_json(worksheet);
            existingData.push(responseData);
            const updatedSheet = XLSX.utils.json_to_sheet(existingData);
            workbook.Sheets[workbook.SheetNames[0]] = updatedSheet;
        } else {
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.json_to_sheet([responseData]);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
        }
        XLSX.writeFile(workbook, EXCEL_FILE);

        // 2. Send email notification directly to your inbox
        const mailOptions = {
            from: 'YOUR_EMAIL@gmail.com',
            to: 'YOUR_EMAIL@gmail.com', // Receives the notification
            subject: 'New Friendship Check-in Response Received',
            text: `New response recorded:\n\n${JSON.stringify(responseData, null, 2)}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Email notification error:", err);
            else console.log("Response emailed successfully:", info.response);
        });

        res.status(200).json({ status: 'success', message: 'Responses recorded securely.' });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ status: 'error', message: 'Server error saving data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});