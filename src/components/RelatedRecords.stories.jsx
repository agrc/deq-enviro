import RelatedRecords from './RelatedRecords';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default {
  title: 'RelatedRecords',
  component: RelatedRecords,
};

export const Default = () => (
  <QueryClientProvider client={new QueryClient()}>
    <div className="h-72 w-full overflow-x-hidden border border-slate-300">
      <RelatedRecords
        relationshipClasses={[
          {
            'Parent Dataset Name': 'BFTARGETED',
            'Related Table Name': 'DEQMAP_CERCLABRANCHACTMAJ',
            'Primary Key': 'ST_KEY',
            'Foreign Key': 'ACLINK_KEY',
          },
          {
            'Parent Dataset Name': 'BFTARGETED',
            'Related Table Name': 'DEQMAP_CERCLABRANCHIC',
            'Primary Key': 'ST_KEY',
            'Foreign Key': 'ICALINKKEY',
          },
        ]}
        attributes={{
          ST_KEY: 10672,
        }}
      />
    </div>
  </QueryClientProvider>
);
