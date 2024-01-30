import Checkbox from '../../utah-design-system/Checkbox';
import Input from '../../utah-design-system/Input';
import RadioGroup from '../../utah-design-system/RadioGroup';

/** @typedef {import('../../../functions/configs').DateFilterConfig} DateFilterConfig */

/**
 * @param {object} props
 * @param {import('../../../functions/common/config').FieldFilterConfig
 *   | import('../../../functions/common/config').CheckboxRadioQueriesFilterConfig
 *   | DateFilterConfig} props.config
 * @param {import('../../contexts/SearchMachineProvider').LayerFilterValue
 *   | null} props.value
 * @param {(
 *   value: import('../../contexts/SearchMachineProvider').LayerFilterValue,
 * ) => void} props.onChange
 * @returns {JSX.Element}
 */
export default function SpecialFilter({ config, value, onChange }) {
  /**
   * @param {boolean} checked
   * @param {string} optionValue
   * @returns {void}
   */
  const onCheckedChange = (checked, optionValue) => {
    if (!value) {
      const newValue = { type: config.type, values: [optionValue] };

      if (config.type === 'field') {
        newValue.field = config.field;
        newValue.fieldType = config.fieldType;
      }

      onChange(newValue);

      return;
    }

    const newValues = checked
      ? [...value.values, optionValue]
      : value.values.filter((v) => v !== optionValue);

    onChange({ ...value, values: newValues });
  };

  const getOnDateChange =
    (/** @type {number} */ index) => (/** @type {string} */ newValue) => {
      let newValues;
      if (!value?.values) {
        newValues = [null, null];
        newValues[index] = newValue;
      } else {
        newValues = [...value.values];
        newValues[index] = newValue;
      }

      onChange({
        type: config.type,
        field: /** @type {DateFilterConfig} */ (config).field,
        values: newValues,
      });
    };

  const isDateInvalid = (/** @type {0 | 1} */ index) => {
    if (!value?.values) {
      return false;
    }

    if (!value.values[index]) {
      return true;
    }

    if (value.values.length === 2 && value.values[0] > value.values[1]) {
      return true;
    }

    return false;
  };

  switch (config.type) {
    case 'field':
    case 'checkbox': {
      return (
        <>
          <b>
            {
              // @ts-ignore
              config.label
            }
          </b>
          {config.options.map((option) => (
            <Checkbox
              key={option.value}
              // @ts-ignore
              name={`${config.type}-${config.field}-${option.value}`}
              label={option.alias}
              checked={value?.values.includes(option.value)}
              onCheckedChange={(checked) =>
                onCheckedChange(checked, option.value)
              }
            />
          ))}
        </>
      );
    }

    case 'radio': {
      return (
        <RadioGroup
          ariaLabel="layer filter group"
          items={config.options.map((option) => ({
            label: option.alias,
            value: option.value,
          }))}
          value={value?.values[0]}
          onValueChange={(newValue) =>
            onChange({ ...value, values: [newValue] })
          }
        />
      );
    }

    case 'date': {
      return (
        <>
          <b>{config.label}</b>
          <Input
            type="date"
            label="From"
            value={value?.values[0] ?? ''}
            required={true}
            invalid={isDateInvalid(0)}
            onChange={getOnDateChange(0)}
            max={value?.values[1] ?? undefined}
          />
          <Input
            type="date"
            label="To"
            value={value?.values[1] ?? ''}
            required={true}
            invalid={isDateInvalid(1)}
            onChange={getOnDateChange(1)}
            min={value?.values[0] ?? undefined}
          />
        </>
      );
    }
  }
}
