import Checkbox from './Checkbox';

export default {
  title: 'Utah Design System/Checkbox',
  component: Checkbox,
};

export const Default = () => (
  <>
    <Checkbox label="checked" checked />
    <Checkbox label="un-checked" />
    <Checkbox label="disabled" disabled />
    <Checkbox label="disabled and checked" checked disabled />
    <div className="w-52 bg-gray-50">
      <Checkbox label="a very long name that wraps and wraps" />
    </div>
  </>
);
