import { useContext } from 'react';
import { InternalFirebaseContext } from './InternalFirebaseContext';

export function useFirebase() {
  const context = useContext(InternalFirebaseContext);

  if (!context) {
    throw new Error(
      'useFirebase must be used within an InternalFirebaseProvider',
    );
  }

  return context;
}
