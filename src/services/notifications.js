import axios from 'axios';

const NTFY_TOPIC = 'ois-garden-notifications'; // Replace with your topic name
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export const sendNotification = async (title, message) => {
  try {
    await axios.post(NTFY_URL, message, {
      headers: {
        'Title': title,
      },
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};