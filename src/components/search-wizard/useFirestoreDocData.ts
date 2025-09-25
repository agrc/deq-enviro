import { useFirestore } from '@ugrc/utah-design-system';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';

export default function useFirestoreDocData(
  collection: string,
  docId: string,
): {
  loading: boolean;
  data: DocumentData | undefined;
  error: Error | null;
} {
  const { firestore } = useFirestore();
  const loading = useRef(false);
  const [data, setData] = useState<DocumentData | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const stopLoading = () => {
      if (loading.current) loading.current = false;
    };

    if (!firestore || !collection || !docId) {
      stopLoading();

      return;
    }

    loading.current = true;

    const unsubscribe = onSnapshot(
      doc(firestore, collection, docId),
      (snapshot) => {
        stopLoading();
        setData(snapshot.data());
      },
      (error) => {
        stopLoading();
        setError(error);
      },
    );

    return () => unsubscribe();
  }, [collection, docId, firestore]);

  return { loading: loading.current, data, error };
}
