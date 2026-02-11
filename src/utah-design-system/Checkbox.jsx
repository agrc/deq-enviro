import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { useId } from 'react';
import { twJoin } from 'tailwind-merge';

export default function Checkbox({
  name,
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
}) {
  const generatedId = useId();
  const labelText = typeof label === 'string' ? label.trim() : '';
  const resolvedId =
    name ||
    (labelText ? labelText.toLowerCase().replace(/\s+/g, '-') : generatedId);
  const resolvedAriaLabel = name?.trim() || labelText || resolvedId;

  return (
    <div className="my-1 flex items-center">
      <div className="group inline-flex items-center">
        <div
          className={twJoin(
            'rounded-full p-1',
            !disabled &&
              'group-active:bg-slate-200 group-hover:bg-slate-200 group-focus:bg-slate-200',
          )}
        >
          <RadixCheckbox.Root
            id={resolvedId}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={resolvedAriaLabel}
            className={twJoin(
              'flex h-4 w-4 items-center justify-center rounded border',
              disabled
                ? 'border-slate-300 bg-slate-50 data-[state=checked]:bg-slate-300 data-[state=checked]:text-white'
                : 'border-slate-500 bg-white data-[state=checked]:bg-slate-500 data-[state=checked]:text-white',
            )}
          >
            <RadixCheckbox.Indicator>
              <CheckIcon className="size-4" aria-hidden="true" />
            </RadixCheckbox.Indicator>
          </RadixCheckbox.Root>
        </div>
        <label
          htmlFor={resolvedId}
          className={twJoin(
            'pl-1 leading-4',
            disabled ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer',
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  /**
   * The name attribute of the checkbox. If not provided, the label will be
   * used.
   */
  name: PropTypes.string,
  onCheckedChange: PropTypes.func,
};
