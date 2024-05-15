import { createTransport } from "nodemailer";
import { logger } from "../index.js";

const transporter = createTransport({
    host: "smtp-pulse.com",
    port: 465, 
    secure: true,
    auth: {
        user: "gyanaranjansahoo509@gmail.com",
        pass: "n4BPFQ6mZSD",
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
            logger.error(`Error in sending email: ${error}`);
        } else {
            logger.info(`Email sent: ${info.response}`);
        }
    });
};
