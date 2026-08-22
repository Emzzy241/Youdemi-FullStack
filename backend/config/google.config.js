import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CLIENT_REDIRECT_URI
)

export default oauth2Client;


// const {google} = require('googleapis');

// const oauth2Client = new google.auth.OAuth2(
//   YOUR_CLIENT_ID,
//   YOUR_CLIENT_SECRET,
//   YOUR_REDIRECT_URL
// );

// // generate a url that asks permissions for Blogger and Google Calendar scopes
// const scopes = [
//   'https://www.googleapis.com/auth/blogger',
//   'https://www.googleapis.com/auth/calendar'
// ];

// const url = oauth2Client.generateAuthUrl({
//   // 'online' (default) or 'offline' (gets refresh_token)
//   access_type: 'offline',

//   // If you only need one scope, you can pass it as a string
//   scope: scopes
// });