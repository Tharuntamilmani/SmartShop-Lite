const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (mobileNumber, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber}`,
    });

    console.log("SMS Sent:", response.sid);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Twilio SMS Error:", error.message);

    return {
      success: false,
    };
  }
};

module.exports = { sendSMS };