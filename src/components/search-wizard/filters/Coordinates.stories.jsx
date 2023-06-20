import Coordinates from './Coordinates';

export default {
  title: 'Filters/Coordinates',
  component: Coordinates,
};

export const Default = () => (
  <div className="w-80">
    <Coordinates send={console.log} />
  </div>
);
