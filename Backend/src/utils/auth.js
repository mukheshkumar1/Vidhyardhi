import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const googleauth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

export default googleauth;

// import { google } from "googleapis";
// import dotenv from "dotenv";
// dotenv.config();

// // Parse the full service account JSON from the env variable
// const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// const googleauth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ["https://www.googleapis.com/auth/drive"],
// });

// export default googleauth;

