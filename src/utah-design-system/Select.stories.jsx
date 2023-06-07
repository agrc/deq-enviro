import { useState } from 'react';
import Select from './Select';

export default {
  title: 'Utah Design System/Select',
  component: Select,
};

const items = [
  {
    label: 'Beaver',
    value: 'beaver',
  },
  {
    label: 'Box Elder',
    value: 'box-elder',
  },
  {
    label: 'Cache',
    value: 'cache',
  },
];

export const Default = () => {
  const [filterType, setFilterType] = useState('cache');

  return (
    <div className="w-80 space-y-2 px-2">
      <div>
        <h4>Placeholder</h4>
        <Select placeholder="select a county..." items={items} />
      </div>

      <div>
        <h4>Initial value</h4>
        <Select
          placeholder="select a county"
          items={items}
          value={filterType}
          onValueChange={setFilterType}
        />
      </div>

      <div>
        <h4>Disabled</h4>
        <Select placeholder="select a county" items={items} disabled />
      </div>
    </div>
  );
};

export const Opened = () => (
  <Select items={items} open placeholder="placeholder" />
);
