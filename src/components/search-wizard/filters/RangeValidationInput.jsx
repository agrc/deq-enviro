import PropTypes from 'prop-types';
import { useState } from 'react';
import Input from '../../../utah-design-system/Input';
import { validate } from './utils';

/**
 * Input component that validates numeric input against a min/max range
 *
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

RangeValidationInput.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
