import {
  FirebaseAnalyticsProvider,
  FirebaseFunctionsProvider,
  FirestoreProvider,
} from '@ugrc/utah-design-system';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import PropTypes from 'prop-types';

export default function FirebaseProvider({ children }) {
  if (import.meta.env.DEV) {
    console.log('connecting to emulators');

    connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
    connectFunctionsEmulator(getFunctions(), 'localhost', 5001);
  }

  return (
    <FirebaseFunctionsProvider>
      <FirebaseAnalyticsProvider>
        <FirestoreProvider>{children}</FirestoreProvider>
      </FirebaseAnalyticsProvider>
    </FirebaseFunctionsProvider>
  );
}

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
