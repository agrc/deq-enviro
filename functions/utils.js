import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import admin from 'firebase-admin';

admin.initializeApp();

const secretsClient = new SecretManagerServiceClient();

export async function getSecret(name) {
  const [version] = await secretsClient.accessSecretVersion({
    name: `projects/${
      admin.app().options.projectId
    }/secrets/${name}/versions/latest`,
  });

  return version.payload.data.toString();
}
