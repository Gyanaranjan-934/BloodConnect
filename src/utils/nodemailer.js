import { createTransport } from "nodemailer";

// Configure the transporter with your SMTP server details
const transporter = createTransport({
    host: "smtp-pulse.com", // Replace with your SMTP server hostname
    port: 465, // Replace with your SMTP server port (common ports are 465 or 587)
    secure: true, // Set to true if your server uses SSL
    auth: {
        user: "gyanaranjansahoo509@gmail.com",
        pass: "n4BPFQ6mZSD", // Replace with your SMTP password
    },
});

export const sendEmail = (recipientEmail, emailSubject, emailText, bodyHTML) => {
    const mailOptions = {
        from: "gyanaranjan_m210676ca@nitc.ac.in",
        to: recipientEmail,
        subject: emailSubject,
        text: emailText,
        html: bodyHTML || "<b>Your email content in HTML</b>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};
