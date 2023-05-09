import * as RadixCheckbox from '@radix-ui/react-checkbox';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Icon from './Icon';

export default function Checkbox({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
}) {
  return (
    <div className="group flex items-center">
      <div
        className={clsx(
          'rounded-full p-1',
          !disabled &&
            'group-hover:bg-slate-200 group-focus:bg-slate-200 group-active:bg-slate-200'
        )}
      >
        <RadixCheckbox.Root
          id={name || label}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={clsx(
            'flex h-4 w-4 items-center justify-center rounded border border-slate-500 bg-white',
            'data-[state=checked]:bg-slate-500 data-[state=checked]:text-white',
            disabled &&
              '!border-slate-300 !bg-slate-50 data-[state=checked]:!bg-slate-300 data-[state=checked]:!text-white'
          )}
        >
          <RadixCheckbox.Indicator>
            <Icon bold name="checkmark" label={label} size="xs" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      </div>
      <label
        htmlFor={name || label}
        className={clsx(
          'ml-1 cursor-pointer leading-5',
          disabled && '!text-slate-300'
        )}
      >
        {label}
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  /**
   * The name attribute of the checkbox. If not provided, the label will be used.
   */
  name: PropTypes.string,
  onChange: PropTypes.func,
};
