import {
  initializeFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { FirestoreProvider, useInitFirestore } from 'reactfire';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export default function FirebaseProvider({ children }) {
  const { status, data: firestoreInstance } = useInitFirestore(
    async (firebaseApp) => {
      const db = initializeFirestore(firebaseApp, {});

      return db;
    },
  );

  // firestore init isn't complete yet
  if (status === 'loading') {
    return null;
  }

  if (import.meta.env.DEV) {
    connectFirestoreEmulator(firestoreInstance, 'localhost', 8080);
  }

  return (
    <FirestoreProvider sdk={firestoreInstance}>{children}</FirestoreProvider>
  );
}
