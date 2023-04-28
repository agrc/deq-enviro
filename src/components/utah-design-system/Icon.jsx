import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const ICONS = {
  account: {
    letter: 'j',
  },
  alert: {
    letter: 'C',
  },
  arrowDown: {
    letter: 'T',
  },
  arrowLeft: {
    letter: 'U',
  },
  arrowRight: {
    letter: 'S',
  },
  arrowUp: {
    letter: 'R',
  },
  bookmark: {
    letter: 'E',
  },
  checkmark: {
    letter: 'G',
  },
  chevronDown: {
    letter: 'P',
  },
  chevronLeft: {
    letter: 'Q',
  },
  chevronRight: {
    letter: 'O',
  },
  chevronUp: {
    letter: 'N',
  },
  circleChevronDown: {
    letter: 'L',
  },
  circleChevronUp: {
    letter: 'M',
  },
  close: {
    letter: 'X',
  },
  copy: {
    letter: 'g',
  },
  doc: {
    letter: 'c',
  },
  docSquare: {
    letter: 'd',
  },
  edit: {
    letter: 'Y',
  },
  editBox: {
    letter: 'Z',
  },
  error: {
    letter: 'f',
  },
  externalLink: {
    letter: 'A',
  },
  gear: {
    letter: 'b',
  },
  hamburger: {
    letter: 'i',
  },
  help: {
    letter: 'D',
  },
  homeMenu: {
    letter: 'h',
  },
  info: {
    letter: 'I',
  },
  lock: {
    letter: 'k',
  },
  minus: {
    letter: 'W',
  },
  plus: {
    letter: 'V',
  },
  search: {
    letter: 'F',
  },
  star: {
    letter: 'H',
  },
  unfoldLess: {
    letter: 'J',
  },
  unfoldMore: {
    letter: 'K',
  },
  verified: {
    letter: 'a',
  },
  waffle: {
    letter: 'B',
  },
  warning: {
    letter: 'e',
  },
};

export default function Icon({ name, label, className, size }) {
  if (!Object.keys(ICONS).includes(name)) {
    throw new Error(`Icon name "${name}" is not valid`);
  }

  return (
    <AccessibleIcon.Root label={label}>
      <span
        className={clsx(
          'flex items-center justify-center',
          `before:font-utds before:content-["${ICONS[name].letter}"] before:text-${size} before:font-normal`,
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
  size: PropTypes.string,
};

Icon.defaultProps = {
  size: 'base',
};

Icon.Names = Object.keys(ICONS).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {});
