import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';
import { validate } from './utils';

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
        : null
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

RangeValidationInput.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
};
