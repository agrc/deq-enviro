import { useFirebaseAnalytics } from '@ugrc/utah-design-system';
import PropTypes from 'prop-types';
import Checkbox from '../../utah-design-system/Checkbox';
import Input from '../../utah-design-system/Input';
import RadioGroup from '../../utah-design-system/RadioGroup';

/** @typedef {import('../../../functions/configs').DateFilterConfig} DateFilterConfig */

/**
 * A component for rendering different types of special filters
 *
 * @returns {JSX.Element}
 */
export default function SpecialFilter({ config, value, onChange }) {
  const logEvent = useFirebaseAnalytics();
  /**
   * @param {boolean} checked
   * @param {string} optionValue
   * @returns {void}
   */
  const onCheckedChange = (checked, optionValue) => {
    logEvent('layer-specific-filter', { ...config });
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
      logEvent('layer-specific-filter', { ...config });
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
              // @ts-expect-error - Type checking bypass needed
              config.label
            }
          </b>
          {config.options.map((option) => (
            <Checkbox
              key={option.value}
              // @ts-expect-error - Type checking bypass needed
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
            onChange({ ...value, values: [newValue], type: config.type })
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

SpecialFilter.propTypes = {
  config: PropTypes.shape({
    type: PropTypes.string.isRequired,
    field: PropTypes.string,
    fieldType: PropTypes.string,
    label: PropTypes.string,
    options: PropTypes.array,
  }).isRequired,
  value: PropTypes.shape({
    values: PropTypes.array.isRequired,
    type: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};
