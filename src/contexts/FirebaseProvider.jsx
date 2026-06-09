import { FirebaseAnalyticsProvider } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';
import { FirebaseFunctionsProvider } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import { FirestoreProvider } from '@ugrc/utah-design-system/contexts/FirestoreProvider';
import PropTypes from 'prop-types';

export default function FirebaseProvider({ children }) {
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
