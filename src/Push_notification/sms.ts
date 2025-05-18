import twilio from 'twilio';
import dotenv from "dotenv";
dotenv.config();
const accountSid =process.env.Account
const authToken = process.env.Token
const client = twilio(accountSid,authToken);

export const sendSMS = async (to: string, message: string) => {
  try {
    const msg = await client.messages.create({
      body: message,
      from: "+18138206654", 
      to: to,
    });
    console.log('Message sent:', msg.sid);
    return msg;
  } catch (err) {
    console.error('Failed to send SMS:', err);
    throw err;
  }
};
