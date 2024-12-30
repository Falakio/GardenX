import axios from 'axios';

const API_URL = 'https://email-api-amansanoj.vercel.app/api/email/send';

export const sendEmail = async (to, subject, text, html) => {
  try {
    const response = await axios.post(API_URL, { to, subject, text, html });
    console.log('Email sent:', response.data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};