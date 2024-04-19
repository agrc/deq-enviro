import { useState } from 'react';
import Input from './Input';

export default {
  title: 'Utah Design System/Input',
  component: Input,
};

export const Default = () => {
  const [value, setValue] = useState(123);

  return (
    <div className="space-y-2">
      <Input label="Default" />
      <Input label="Inline" inline className="w-40" />
      <Input label="Another Inline" inline className="ml-2 w-96" />
      <Input label="Disabled" disabled />
      <Input label="Required" required className="w-1/2" />
      <Input
        label="Invalid"
        invalid
        message="You must enter a valid email address!"
      />
      <Input
        label="Invalid Inline"
        invalid
        inline
        message="You must enter a valid email address!"
      />
      <Input label="Another Inline" inline className="ml-2" />
      <Input
        label="Controlled"
        value={value}
        onChange={setValue}
        message={`controlled value: ${value}`}
      />
      <Input
        label="Min 1, Max 10, Step 0.5"
        min={1}
        max={10}
        step={0.5}
        type="number"
      />
      <Input label="Date" type="date" />
      <Input label="prefix" prefix="$" value="test" />
      <Input
        label="invalid prefix"
        prefix="$"
        value="test"
        invalid
        message="this is invalid"
      />
      <Input label="suffix" suffix={<span>test</span>} value="test" />
      <Input
        label="invalid suffix"
        suffix={<span>test</span>}
        value="test"
        invalid
        message="this is invalid"
      />
    </div>
  );
};
