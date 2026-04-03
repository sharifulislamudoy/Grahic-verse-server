const express = require("express");
const nodemailer = require("nodemailer");

// The route factory – receives the MongoDB client from server.js
module.exports = (dbClient) => {
    const router = express.Router();

    // Configure SMTP transporter for Hostinger (or any provider)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
        if (error) {
            console.error("SMTP connection error:", error);
        } else {
            console.log("SMTP server is ready to send emails");
        }
    });

    // Contact form submission endpoint
    router.post("/send", async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            // Validation
            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address",
                });
            }

            // Email content
            const mailOptions = {
                from: `"${name}" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                replyTo: email,
                subject: `Contact Form: ${subject}`,
                text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
                `,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #022F2B;">New Contact Form Submission</h2>
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 10px 0; font-weight: bold; width: 100px;">Name:</td>
            <td style="padding: 10px 0;">${name}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0;">${email}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-weight: bold;">Subject:</td>
            <td style="padding: 10px 0;">${subject}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 10px 0;">${message.replace(/\n/g, "<br>")}</td>
        </tr>
    </table>
    <hr style="margin: 20px 0; border-color: #FF7537;">
    <p style="color: #666; font-size: 12px;">This email was sent from your website contact form. Reply directly to ${email} to respond to ${name}.</p>
</div>
                `,
            };

            // Send email
            await transporter.sendMail(mailOptions);

            // Save to MongoDB using the injected dbClient
            const db = dbClient.db(process.env.DB_NAME);
            const contacts = db.collection("contacts");
            await contacts.insertOne({
                name,
                email,
                subject,
                message,
                createdAt: new Date(),
            });

            res.status(200).json({
                success: true,
                message: "Your message has been sent successfully!",
            });
        } catch (error) {
            console.error("Email sending error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send message. Please try again later.",
            });
        }
    });

    return router;
};