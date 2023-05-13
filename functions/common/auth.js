import { google } from 'googleapis';

export default async function auth(scopes) {
  console.log('initializing authentication...');

  const auth = new google.auth.GoogleAuth({
    scopes,
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  return authClient;
}
