import * as Label from '@radix-ui/react-label';
import PropTypes from 'prop-types';
import { twJoin, twMerge } from 'tailwind-merge';

export default function Input({
  className,
  disabled,
  id,
  inline,
  invalid,
  label,
  max,
  message,
  min,
  onChange,
  required,
  step,
  type = 'text',
  value,
}) {
  if (!id) {
    id = label.toLowerCase().replace(' ', '-');
  }

  return (
    <div
      className={twMerge(
        inline ? 'inline-flex items-center' : 'flex flex-col',
        className
      )}
    >
      <Label.Root asChild className="mr-2" htmlFor={id}>
        <strong>
          {label}
          {required && <span className="ml-[0.1rem] text-error-500">*</span>}
        </strong>
      </Label.Root>
      <div className="flex flex-1 flex-col">
        <div
          className={twJoin(
            '-m-1 rounded-md p-1',
            !disabled && 'hover:bg-slate-200'
          )}
        >
          <input
            className={twMerge(
              'h-8 w-full rounded-md border-slate-400 px-2 py-1',
              !inline && 'w-full',
              invalid && 'border-2 border-error-500',
              disabled
                ? 'cursor-not-allowed border-slate-300 bg-slate-100'
                : 'bg-white'
            )}
            type={type}
            min={min}
            max={max}
            step={step}
            id={id}
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={required}
          />
        </div>
        {message && (
          <span className={twJoin('text-sm', invalid && 'text-error-500')}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

Input.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  inline: PropTypes.bool,
  invalid: PropTypes.bool,
  label: PropTypes.string.isRequired,
  max: PropTypes.number,
  message: PropTypes.string,
  min: PropTypes.number,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  step: PropTypes.number,
  type: PropTypes.oneOf([
    'date',
    'datetime-local',
    'email',
    'hidden',
    'month',
    'number',
    'password',
    'search',
    'tel',
    'text',
    'time',
    'url',
    'week',
  ]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
