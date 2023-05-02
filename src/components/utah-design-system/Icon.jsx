import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import clsx from 'clsx';
import PropTypes from 'prop-types';

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
  sm: 'before:text-sm',
  base: 'before:text-base',
  lg: 'before:text-lg',
  xl: 'before:text-xl',
};

export default function Icon({ name, label, className, size, bold }) {
  if (!Object.keys(ICONS).includes(name)) {
    throw new Error(`Icon name "${name}" is not valid`);
  }

  if (!Object.keys(SIZE_CLASS_NAMES).includes(size)) {
    throw new Error(`Icon size "${size}" is not valid`);
  }

  return (
    <AccessibleIcon.Root label={label}>
      <span
        className={clsx(
          'flex items-center justify-center',
          ICONS[name].className,
          SIZE_CLASS_NAMES[size],
          'before:font-utds',
          bold ? 'before:font-bold' : 'before:font-normal',
          className
        )}
        aria-hidden="true"
      />
    </AccessibleIcon.Root>
  );
}

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  /**
   * Size of the icon. Corresponds with the tailwind text sizes (base, sm, lg, xl)
   */
  size: PropTypes.oneOf(Object.keys(SIZE_CLASS_NAMES)),
  bold: PropTypes.bool,
};

Icon.defaultProps = {
  size: 'base',
};

Icon.Names = Object.keys(ICONS).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {});
