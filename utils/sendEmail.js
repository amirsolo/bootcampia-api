const nodemailer = require('nodemailer')

const sendEmail = async ({ email, subject, message }) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    FROM_NAME,
    FROM_EMAIL
  } = process.env

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    }
  })

  // define transport options
  const emailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: subject,
    text: message
  }

  // Send email
  const info = await transporter.sendMail(emailOptions)

  console.log('Message sent: %s', info.messageId)
}

module.exports = sendEmail
