import Checkbox from './Checkbox';
import Input from './Input';
import RadioGroup from './RadioGroup';
import Select from './Select';
import Sherlock, { LocatorSuggestProvider } from './Sherlock';

export default {
  title: 'Utah Design System/All Components',
};

const items = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
];

export const Default = () => (
  <div className="space-y-2">
    <Select placeholder="Select" items={items} />
    <Sherlock
      label="Sherlock"
      maxResultsToDisplay={5}
      placeHolder="search by address..."
      provider={
        new LocatorSuggestProvider(
          'https://masquerade.ugrc.utah.gov/arcgis/rest/services/UtahLocator/GeocodeServer',
          3857
        )
      }
    />
    <Input label="Input" />
    <Checkbox label="checked" checked />
    <RadioGroup ariaLabel="storybook test" items={items} defaultValue="two" />
  </div>
);
