import nodeMailer from "nodemailer"

export const transport = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD
    },
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000,
    socketTimeout: 15000,
})

