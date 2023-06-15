import StreetAddress from './StreetAddress';

export default {
  title: 'Filters/StreetAddress',
  component: StreetAddress,
};

export const Default = () => <StreetAddress send={console.log} />;
