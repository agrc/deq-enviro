import * as RadixCheckbox from '@radix-ui/react-checkbox';
import PropTypes from 'prop-types';
import { twJoin } from 'tailwind-merge';
import Icon from './Icon';

export default function Checkbox({
  name,
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
}) {
  return (
    <div className="my-1 flex items-center">
      <div className="group inline-flex items-center">
        <div
          className={twJoin(
            'rounded-full p-1',
            !disabled &&
              'group-hover:bg-slate-200 group-focus:bg-slate-200 group-active:bg-slate-200',
          )}
        >
          <RadixCheckbox.Root
            id={name || label}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={twJoin(
              'flex h-4 w-4 items-center justify-center rounded border',
              disabled
                ? 'border-slate-300 bg-slate-50 data-[state=checked]:bg-slate-300 data-[state=checked]:text-white'
                : 'border-slate-500 bg-white data-[state=checked]:bg-slate-500 data-[state=checked]:text-white',
            )}
          >
            <RadixCheckbox.Indicator>
              <Icon bold name="check" label={label} size="xs" />
            </RadixCheckbox.Indicator>
          </RadixCheckbox.Root>
        </div>
        <label
          htmlFor={name || label}
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
