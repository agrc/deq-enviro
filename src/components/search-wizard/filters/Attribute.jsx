import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';
import RadioGroup from '../../../utah-design-system/RadioGroup';
import Tag from '../../Tag';

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
 * Attribute search filter component
 *
 * @returns {JSX.Element}
 */
export default function Attribute({
  send,
  label,
  selectedLayers,
  fieldName,
  configName,
}) {
  const [queryType, setQueryType] = useState('all');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const values = inputValue
      .split(' ')
      .map((value) => value.trim())
      .filter((value) => value);
    send({
      type: 'SET_FILTER',
      filter: {
        geometry: null,
        name: `${label} search: ${values} (${queryType})`,
        attribute: /** @type {AttributeFilter} */ {
          values,
          queryType,
          fieldName,
          configName,
        },
      },
    });
  }, [label, inputValue, queryType, send, fieldName, configName]);

  return (
    <>
      <h4>Search by {label} Field</h4>

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

Attribute.propTypes = {
  send: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  selectedLayers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      field: PropTypes.string,
    }),
  ).isRequired,
  fieldName: PropTypes.string,
  configName: PropTypes.string,
};
