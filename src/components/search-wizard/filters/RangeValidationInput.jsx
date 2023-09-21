import { useState } from 'react';
import Input from '../../../utah-design-system/Input';
import { validate } from './utils';

/**
 * @typedef {Object} RangeValidationInputProps
 * @param {Object} props
 * @param {number} props.min
 * @param {number} props.max
 * @param {number} [props.step]
 * @param {number | string} [props.value]
 * @param {function} props.onChange
 */

/**
 * RangeValidationInput
 *
 * @param {RangeValidationInputProps &
 *   import('../../../utah-design-system/Input')} props
 * @returns {JSX.Element}
 */
export default function RangeValidationInput({
  min,
  max,
  step,
  onChange,
  value,
  ...props
}) {
  if (max < min) {
    throw new Error('max must be greater than or equal to min');
  }

  const [invalidMessage, setInvalidMessage] = useState(null);
  const [internalValue, setInternalValue] = useState(value || '');

  const onChangeValue = (newValue) => {
    setInternalValue(newValue);
    const validateMessage = validate(newValue, min, max);
    setInvalidMessage(validateMessage);
    onChange(
      validateMessage === null && newValue?.trim() !== '' ? newValue : null,
    );
  };

  return (
    <Input
      min={min}
      max={max}
      step={step}
      message={invalidMessage}
      invalid={invalidMessage !== null}
      value={internalValue}
      onChange={onChangeValue}
      {...props}
    />
  );
}
