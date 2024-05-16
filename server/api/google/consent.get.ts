import { google } from 'googleapis';

export default defineEventHandler((_event) => {
  const config = useRuntimeConfig().google;

  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUrl,
  );

  const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes,
  });

  return url;
});
