import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createKeyLookup } from './utils';

const COLORS = {
  none: {
    outlined: [
      'border-slate-600 text-slate-600',
      'focus:border-slate-600 focus:ring-slate-600',
      'hover:border-slate-600 hover:bg-slate-600',
    ].join(' '),
    solid: [
      'border-slate-600 bg-slate-600 text-white',
      'focus:border-slate-600 focus:ring-slate-600',
      'hover:border-slate-700 hover:bg-slate-700',
    ].join(' '),
  },
  primary: {
    outlined: [
      'border-primary text-primary',
      'focus:border-primary focus:ring-primary',
      'hover:border-primary hover:bg-primary',
    ].join(' '),
    solid: [
      'border-primary bg-primary text-white',
      'focus:border-primary focus:ring-primary',
      'hover:border-primary-dark hover:bg-primary-dark',
    ].join(' '),
  },
  secondary: {
    outlined: [
      'border-secondary text-secondary',
      'focus:border-secondary focus:ring-secondary',
      'hover:border-secondary hover:bg-secondary',
    ].join(' '),
    solid: [
      'border-secondary bg-secondary text-white',
      'focus:border-secondary focus:ring-secondary',
      'hover:border-secondary-dark hover:bg-secondary-dark',
    ].join(' '),
  },
  accent: {
    outlined: [
      'border-accent text-accent',
      'focus:border-accent focus:ring-accent',
      'hover:border-accent hover:bg-accent',
    ].join(' '),
    solid: [
      'border-accent bg-accent text-white',
      'focus:border-accent focus:ring-accent',
      'hover:border-accent-dark hover:bg-accent-dark',
    ].join(' '),
  },
};

const APPEARANCES = {
  solid: 'solid',
  outlined: 'outlined',
};

const SIZES = {
  xs: 'text-xs px-2 py-0',
  sm: 'text-sm px-3 py-0 h-6',
  base: 'px-7 py-1 h-8 min-h-[2rem]',
  lg: 'text-lg px-8 py-2 h-10 min-h-[2.5rem]',
  xl: 'text-xl px-10 py-3 h-12 min-h-[3rem]',
};

function Button({
  appearance,
  busy,
  children,
  className,
  color,
  disabled,
  onClick,
  size,
}) {
  if (busy) {
    disabled = true;
  }

  return (
    <button
      className={clsx(
        'flex w-fit cursor-pointer items-center justify-center rounded-full',
        appearance === APPEARANCES.outlined && 'border-2',
        COLORS[color][appearance],
        SIZES[size],
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-opacity-50',
        'hover:text-white',
        !disabled && 'active:scale-95 active:shadow-inner',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {busy && (
        <svg
          className="ml-1 h-5 w-5 animate-spin motion-reduce:hidden"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
    </button>
  );
}

Button.propTypes = {
  appearance: PropTypes.oneOf(Object.keys(APPEARANCES)),
  busy: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.oneOf(Object.keys(COLORS)),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  /**
   * Size of the button. Corresponds with the tailwind text sizes (base, sm, lg, xl)
   */
  size: PropTypes.oneOf(Object.keys(SIZES)),
};

Button.defaultProps = {
  appearance: 'outlined',
  busy: false,
  color: 'none',
  disabled: false,
  size: 'base',
};

Button.Colors = createKeyLookup(COLORS);
Button.Appearances = createKeyLookup(APPEARANCES);
Button.Sizes = createKeyLookup(SIZES);

export default Button;
