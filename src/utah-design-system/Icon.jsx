import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

// preview these at: https://designsystem.dev.utah.gov/resources/icons
const ICONS = {
  account: {
    className: 'before:content-["j"]',
  },
  alert: {
    className: 'before:content-["C"]',
  },
  arrowDown: {
    className: 'before:content-["T"]',
  },
  arrowLeft: {
    className: 'before:content-["U"]',
  },
  arrowRight: {
    className: 'before:content-["S"]',
  },
  arrowUp: {
    className: 'before:content-["R"]',
  },
  bookmark: {
    className: 'before:content-["E"]',
  },
  checkmark: {
    className: 'before:content-["G"]',
  },
  chevronDown: {
    className: 'before:content-["P"]',
  },
  chevronLeft: {
    className: 'before:content-["Q"]',
  },
  chevronRight: {
    className: 'before:content-["O"]',
  },
  chevronUp: {
    className: 'before:content-["N"]',
  },
  circleChevronDown: {
    className: 'before:content-["L"]',
  },
  circleChevronUp: {
    className: 'before:content-["M"]',
  },
  close: {
    className: 'before:content-["X"]',
  },
  copy: {
    className: 'before:content-["g"]',
  },
  doc: {
    className: 'before:content-["c"]',
  },
  docSquare: {
    className: 'before:content-["d"]',
  },
  edit: {
    className: 'before:content-["Y"]',
  },
  editBox: {
    className: 'before:content-["Z"]',
  },
  error: {
    className: 'before:content-["f"]',
  },
  externalLink: {
    className: 'before:content-["A"]',
  },
  gear: {
    className: 'before:content-["b"]',
  },
  hamburger: {
    className: 'before:content-["i"]',
  },
  help: {
    className: 'before:content-["D"]',
  },
  homeMenu: {
    className: 'before:content-["h"]',
  },
  info: {
    className: 'before:content-["I"]',
  },
  lock: {
    className: 'before:content-["k"]',
  },
  minus: {
    className: 'before:content-["W"]',
  },
  moreHorizontal: {
    className: 'before:content-["m"]',
  },
  moreVertical: {
    className: 'before:content-["l"]',
  },
  plus: {
    className: 'before:content-["V"]',
  },
  search: {
    className: 'before:content-["F"]',
  },
  star: {
    className: 'before:content-["H"]',
  },
  unfoldLess: {
    className: 'before:content-["J"]',
  },
  unfoldMore: {
    className: 'before:content-["K"]',
  },
  verified: {
    className: 'before:content-["a"]',
  },
  waffle: {
    className: 'before:content-["B"]',
  },
  warning: {
    className: 'before:content-["e"]',
  },
};

const SIZE_CLASS_NAMES = {
  xs: 'before:text-xs',
  sm: 'before:text-sm',
  base: 'before:text-base',
  lg: 'before:text-lg',
  xl: 'before:text-xl',
  '2xl': 'before:text-2xl',
  '3xl': 'before:text-3xl',
  '4xl': 'before:text-4xl',
  '5xl': 'before:text-5xl',
  '6xl': 'before:text-6xl',
  '7xl': 'before:text-7xl',
  '8xl': 'before:text-8xl',
  '9xl': 'before:text-9xl',
};

/**
 * @typedef {Object} IconProps
 * @property {keyof typeof ICONS} name
 * @property {string} label
 * @property {import('tailwind-merge').ClassNameValue} [className]
 * @property {keyof typeof SIZE_CLASS_NAMES} [size]
 * @property {boolean} [bold]
 */

/**
 * InnerIcon
 *
 * @param {IconProps & import('react').HTMLAttributes<HTMLSpanElement>} props
 * @param {import('react').Ref<any>} forwardedRef
 * @returns {JSX.Element}
 */
function InnerIcon(
  { name, label, className, size = 'base', bold, ...props },
  forwardedRef,
) {
  if (!Object.keys(ICONS).includes(name)) {
    throw new Error(`Icon name "${name}" is not valid`);
  }

  if (!Object.keys(SIZE_CLASS_NAMES).includes(size)) {
    throw new Error(`Icon size "${size}" is not valid`);
  }

  return (
    <AccessibleIcon.Root label={label}>
      <span
        /*
          the next two lines are required if this component is
          used within a Radix primitive with an `asChild` prop
          ref: https://github.com/radix-ui/primitives/issues/953#issuecomment-959005835
        */
        {...props}
        ref={forwardedRef}
        className={twMerge(
          'inline-flex items-center justify-center',
          ICONS[name].className,
          SIZE_CLASS_NAMES[size],
          'before:font-utds',
          bold ? 'before:font-bold' : 'before:font-normal',
          className,
        )}
      />
    </AccessibleIcon.Root>
  );
}

const Icon = forwardRef(InnerIcon);

export default Icon;
