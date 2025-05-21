import * as Label from '@radix-ui/react-label';
import PropTypes from 'prop-types';
import { twJoin, twMerge } from 'tailwind-merge';

/** Input component for capturing user input with consistent styling */
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
  prefix,
  required,
  step,
  suffix,
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
        className,
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
            '-m-1 flex items-center rounded-md p-1',
            !disabled && 'hover:bg-slate-200',
          )}
        >
          {prefix ? (
            <div
              className={twMerge(
                'flex h-8 items-center justify-center rounded-s-md border border-solid border-slate-400 bg-slate-100 p-2',
                invalid && 'border-2 border-error-500 bg-error-100',
              )}
            >
              {prefix}
            </div>
          ) : null}
          <input
            className={twMerge(
              'h-8 w-full rounded-md border-slate-400 px-2 py-1',
              !inline && 'w-full',
              invalid && 'border-2 border-error-500',
              disabled
                ? 'cursor-not-allowed border-slate-300 bg-slate-100'
                : 'bg-white',
              prefix ? 'rounded-s-none border-s-0' : null,
              suffix ? 'rounded-e-none border-e-0' : null,
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
          {suffix ? (
            <div
              className={twMerge(
                'flex h-8 items-center justify-center rounded-e-md border border-solid border-slate-400 bg-slate-100 p-2',
                invalid && 'border-2 border-error-500 bg-error-100',
              )}
            >
              {suffix}
            </div>
          ) : null}
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
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  message: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  prefix: PropTypes.node,
  required: PropTypes.bool,
  step: PropTypes.number,
  suffix: PropTypes.node,
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
