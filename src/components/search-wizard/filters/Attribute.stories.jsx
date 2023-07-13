import Attribute from './Attribute';

export default {
  title: 'Filters/Attribute',
  component: Attribute,
};

const selectedLayers = [
  {
    name: 'A Great Layer Name',
    field: 'ID_FIELD',
  },
  {
    name: 'Another Great Layer Name',
    field: 'ID',
  },
  {
    name: 'A Third Great Layer Name',
    field: 'UID_FIELD_NAME',
  },
];

export const Default = () => (
  <div className="w-80">
    <Attribute
      send={console.log}
      attributeType="id"
      selectedLayers={selectedLayers}
    />
  </div>
);
