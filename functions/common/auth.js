import { google } from 'googleapis';

/** @param {string[]} scopes */
export default async function auth(scopes) {
  console.log('initializing authentication...');

  const auth = new google.auth.GoogleAuth({
    scopes,
  });

  const authClient = await auth.getClient();
  // @ts-expect-error - The google auth client types don't match perfectly
  google.options({ auth: authClient });

  return authClient;
}
