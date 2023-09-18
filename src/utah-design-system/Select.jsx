import * as RadixSelect from '@radix-ui/react-select';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';

/**
 * Select
 *
 * @param {Object} props
 * @param {import('tailwind-merge').ClassNameValue} [props.className]
 * @param {boolean} [props.disabled]
 * @param {{ label: string; value: string }[]} props.items
 * @param {(value: string) => void} [props.onValueChange]
 * @param {boolean} [props.open]
 * @param {string} [props.placeholder]
 * @param {string} [props.value]
 */
export default function Select({
  className,
  disabled,
  items,
  onValueChange,
  open,
  placeholder,
  value,
}) {
  return (
    <RadixSelect.Root
      open={open}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        className={twMerge(
          'group flex h-8 w-full items-center justify-between rounded-md border border-slate-400 px-2 py-1',
          disabled && 'cursor-not-allowed text-slate-300',
          'data-[placeholder]:text-slate-500',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <Icon name="chevronDown" size="xs" label="toggle dropdown" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={2}
          avoidCollisions={false}
        >
          <RadixSelect.Viewport className="box-border w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-slate-400 bg-white py-1">
            {items.map((item) => (
              <RadixSelect.Item
                value={item.value}
                key={item.value}
                className="rounded-none px-2 py-1 hover:bg-primary hover:text-white focus-visible:outline-none"
              >
                <RadixSelect.ItemText>{item.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
