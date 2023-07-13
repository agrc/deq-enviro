import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';
import RadioGroup from '../../../utah-design-system/RadioGroup';

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

export default function Attribute({ send, attributeType, selectedLayers }) {
  const [queryType, setQueryType] = useState('all');
  const [inputValue, setInputValue] = useState('');

  const attributeConfig = attributeTypes[attributeType];

  useEffect(() => {
    send('SET_FILTER', {
      filter: {
        geometry: null,
        name: `${attributeConfig.label} Search`,
        attribute: {
          values: inputValue
            .split(' ')
            .map((value) => value.trim())
            .filter((value) => value),
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
          <span className="rounded-full bg-slate-100 px-2 py-0 text-sm">
            {field}
          </span>
        </div>
      ))}

      <Input label="Search Terms" onChange={setInputValue} value={inputValue} />

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

Attribute.propTypes = {
  send: PropTypes.func.isRequired,
  attributeType: PropTypes.oneOf(Object.keys(attributeTypes)).isRequired,
  selectedLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
};
