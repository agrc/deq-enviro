import { getAnalytics, logEvent as logEventBase } from 'firebase/analytics';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { useCallback } from 'react';
import {
  AnalyticsProvider,
  FirestoreProvider,
  FunctionsProvider,
  useAnalytics,
  useFirebaseApp,
} from 'reactfire';
import { InternalFirebaseContext } from './InternalFirebaseContext';

/*
Make importing logEvent (and others?) easier by wrapping it in a provider.
This also allows us to mock it for Storybook.
*/
function InternalFirebaseProvider({ children }) {
  const analytics = useAnalytics();

  /**
   * @param {string} eventName
   * @param {object} eventParams
   * @returns Void
   */
  const logEvent = useCallback(
    (eventName, eventParams) => {
      logEventBase(analytics, eventName, eventParams);
    },
    [analytics],
  );

  return (
    <InternalFirebaseContext.Provider value={{ logEvent }}>
      {children}
    </InternalFirebaseContext.Provider>
  );
}

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
          <InternalFirebaseProvider>{children}</InternalFirebaseProvider>
        </FirestoreProvider>
      </AnalyticsProvider>
    </FunctionsProvider>
  );
}
