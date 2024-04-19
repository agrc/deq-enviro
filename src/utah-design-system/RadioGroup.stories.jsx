import RadioGroup from './RadioGroup';

export default {
  title: 'Utah Design System/RadioGroup',
  component: RadioGroup,
};

const items = [
  { label: 'One', value: 'one' },
  {
    label: 'A very long label that wraps around at least one line',
    value: 'two',
  },
  { label: 'Three', value: 'three' },
  { label: 'Disabled', value: 'four', disabled: true },
];

export const Default = () => (
  <div className="w-80">
    <RadioGroup ariaLabel="storybook test" items={items} defaultValue="two" />
  </div>
);
