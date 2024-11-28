require('dotenv').config();
const cors = require('cors');

const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.FRONTEND_URL // Adjust this to your frontend URL
}));

mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}/${process.env.MONGODB_DATABASE_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('database connected')).catch((e) => console.log(`database error: ${e}`));

// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve the React app for unknown paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const mongoRoute = require('./Routes/mongo.js');
app.use('/api/data', mongoRoute);

//mail template route
app.post('/send-welcome-email', async (req, res) => {
  const { email, eid, password } = req.body;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${process.env.MAIL_USER}`, // Replace with your email
      pass: `${process.env.MAIL_PASS}`,  // Replace with your email password or app-specific password
    },
  });

  // Create the email options
  let mailOptions = {
    from: process.env.MAIL_USER, // Sender name and email
    to: email, // Recipient email
    subject: 'Welcome to the Company', // Email subject
    html: `
      <p>Your login credentials are as follows:</p>
      <ul>
        <li><strong>EID:</strong> ${eid}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Welcome email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});