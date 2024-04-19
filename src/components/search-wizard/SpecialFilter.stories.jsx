import { useEffect, useState } from 'react';
import SpecialFilter from './SpecialFilter';

export default {
  title: 'SpecialFilter',
  component: SpecialFilter,
};

export const Default = () => {
  const [values, setValues] = useState({
    field: {
      type: 'field',
      field: 'FieldName',
      fieldType: 'number',
      values: ['1'],
    },
    checkbox: null,
    radio: null,
    date: null,
  });

  useEffect(() => {
    console.log(values);
  }, [values]);

  const getOnChange = (key) => (newValue) =>
    // @ts-ignore
    setValues((previousValues) => ({
      ...previousValues,
      [key]: newValue,
    }));

  return (
    <div className="flex flex-col">
      <SpecialFilter
        config={{
          type: 'field',
          field: 'FieldName',
          fieldType: 'number',
          label: 'Field Filter',
          options: [
            {
              value: '1',
              alias: 'one',
            },
            {
              value: '2',
              alias: 'two',
            },
          ],
        }}
        // @ts-ignore
        value={values.field}
        onChange={getOnChange('field')}
      />
      <hr />
      <SpecialFilter
        config={{
          type: 'checkbox',
          options: [
            {
              value: '1',
              alias: 'one',
            },
            {
              value: '2',
              alias: 'two',
            },
          ],
        }}
        value={values.checkbox}
        onChange={getOnChange('checkbox')}
      />
      <hr />
      [Radio]
      <SpecialFilter
        config={{
          type: 'radio',
          options: [
            {
              value: '1',
              alias: 'one',
            },
            {
              value: '2',
              alias: 'two',
            },
          ],
        }}
        value={values.radio}
        onChange={getOnChange('radio')}
      />
      <hr />
      [Date]
      <SpecialFilter
        config={{
          type: 'date',
          field: 'FieldName',
          label: 'Date Filter',
        }}
        value={values.date}
        onChange={getOnChange('date')}
      />
    </div>
  );
};
