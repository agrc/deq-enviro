import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import PropTypes from 'prop-types';
import { twJoin } from 'tailwind-merge';

export default function RadioGroup({
  ariaLabel,
  items,
  defaultValue,
  value,
  onValueChange,
}) {
  return (
    <RadixRadioGroup.Root
      aria-label={ariaLabel}
      className="flex flex-col items-start"
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      {items.map((item) => {
        const id = `${ariaLabel}-${item.value}`;

        return (
          <div className="group flex items-center" key={id}>
            <div
              className={twJoin(
                'rounded-full p-1',
                !item.disabled &&
                  'group-hover:bg-slate-200 group-focus:bg-slate-200 group-active:bg-slate-200'
              )}
            >
              <RadixRadioGroup.Item
                className={twJoin(
                  'flex h-4 w-4 items-center justify-center rounded-full border ',
                  item.disabled
                    ? 'border-slate-300 bg-slate-50 data-[state=checked]:bg-slate-300 data-[state=checked]:text-white'
                    : 'border-slate-500 bg-white'
                )}
                value={item.value}
                id={id}
                disabled={item.disabled}
              >
                <RadixRadioGroup.Indicator
                  className={twJoin(
                    'after:block after:h-4 after:w-4',
                    'after:rounded-full after:content-[""]',
                    'after:border-4 after:border-slate-500'
                  )}
                />
              </RadixRadioGroup.Item>
            </div>
            <label
              htmlFor={id}
              className={twJoin(
                'pl-1 leading-5',
                item.disabled
                  ? 'cursor-not-allowed text-slate-300'
                  : 'cursor-pointer'
              )}
            >
              {item.label}
            </label>
          </div>
        );
      })}
    </RadixRadioGroup.Root>
  );
}

RadioGroup.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
};
