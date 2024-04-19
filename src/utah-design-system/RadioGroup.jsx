import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { twJoin, twMerge } from 'tailwind-merge';

/**
 * @param {object} props
 * @param {string} props.ariaLabel
 * @param {string} [props.className]
 * @param {string} [props.defaultValue]
 * @param {{
 *   value: string;
 *   label: string | JSX.Element;
 *   disabled?: boolean;
 * }[]} props.items
 * @param {(value: string) => void} [props.onValueChange]
 * @param {string} [props.value]
 */
export default function RadioGroup({
  ariaLabel,
  className,
  defaultValue,
  items,
  onValueChange,
  value,
}) {
  return (
    <RadixRadioGroup.Root
      aria-label={ariaLabel}
      className={twMerge('flex flex-col items-start', className)}
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
                  'group-hover:bg-slate-200 group-focus:bg-slate-200 group-active:bg-slate-200',
              )}
            >
              <RadixRadioGroup.Item
                className={twJoin(
                  'flex h-4 w-4 items-center justify-center rounded-full border ',
                  item.disabled
                    ? 'border-slate-300 bg-slate-50 data-[state=checked]:bg-slate-300 data-[state=checked]:text-white'
                    : 'border-slate-500 bg-white',
                )}
                value={item.value}
                id={id}
                disabled={item.disabled}
              >
                <RadixRadioGroup.Indicator
                  className={twJoin(
                    'after:block after:h-4 after:w-4',
                    'after:rounded-full after:content-[""]',
                    'after:border-4 after:border-slate-500',
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
                  : 'cursor-pointer',
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
