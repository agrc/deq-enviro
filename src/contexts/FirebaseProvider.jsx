import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import {
  FunctionsProvider,
  AnalyticsProvider,
  FirestoreProvider,
  useFirebaseApp,
} from 'reactfire';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export default function FirebaseProvider({ children }) {
  const app = useFirebaseApp();

  if (import.meta.env.DEV) {
    console.log('connecting to emulators');

    connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
    connectFunctionsEmulator(getFunctions(), 'localhost', 5001);
  }

  return (
    <FunctionsProvider sdk={getFunctions(app)}>
      <AnalyticsProvider sdk={getAnalytics(app)}>
        <FirestoreProvider sdk={getFirestore(app)}>
          {children}
        </FirestoreProvider>
      </AnalyticsProvider>
    </FunctionsProvider>
  );
}
