import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';
import RadioGroup from '../../../utah-design-system/RadioGroup';
import Tag from '../../Tag';

const attributeTypes = {
  id: {
    label: 'ID',
  },
  name: {
    label: 'Name',
  },
};

const queryTypes = [
  {
    label: (
      <>
        Include results with <u>all</u> the search terms
      </>
    ),
    value: 'all',
  },
  {
    label: (
      <>
        Include results with <u>any</u> of the search terms
      </>
    ),
    value: 'any',
  },
];

/**
 * @param {Object} props
 * @param {Function} props.send
 * @param {string} props.attributeType
 * @param {{ name: string; field: string }[]} props.selectedLayers
 * @returns {JSX.Element}
 */
export default function Attribute({ send, attributeType, selectedLayers }) {
  const [queryType, setQueryType] = useState('all');
  const [inputValue, setInputValue] = useState('');

  const attributeConfig = attributeTypes[attributeType];
  useEffect(() => {
    const values = inputValue
      .split(' ')
      .map((value) => value.trim())
      .filter((value) => value);
    send('SET_FILTER', {
      filter: {
        geometry: null,
        name: `${attributeConfig.label} search: ${values} (${queryType})`,
        attribute: {
          values,
          queryType,
          attributeType,
        },
      },
    });
  }, [attributeConfig.label, attributeType, inputValue, queryType, send]);

  return (
    <>
      <h4>Search by {attributeConfig.label} Field</h4>

      {selectedLayers.map(({ name, field }) => (
        <div key={name} className="leading-5">
          {name}
          <br></br>
          <Tag>{field}</Tag>
        </div>
      ))}

      <Input
        label="Search Terms (space-separated)"
        onChange={setInputValue}
        value={inputValue}
      />

      <RadioGroup
        className="mt-2"
        items={queryTypes}
        ariaLabel="query type selector"
        value={queryType}
        onValueChange={setQueryType}
      />
    </>
  );
}
