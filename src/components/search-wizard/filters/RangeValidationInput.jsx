import { useEffect, useState } from 'react';
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
  const [invalidMessage, setInvalidMessage] = useState(null);
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    const validateMessage = validate(internalValue, min, max);
    setInvalidMessage(validateMessage);
    onChange(
      validateMessage === null && internalValue?.trim() !== ''
        ? internalValue
        : null,
    );
  }, [max, min, onChange, internalValue]);

  return (
    <Input
      min={min}
      max={max}
      step={step}
      message={invalidMessage}
      invalid={invalidMessage !== null}
      value={internalValue}
      onChange={setInternalValue}
      {...props}
    />
  );
}
