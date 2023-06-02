import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import Spinner from './Spinner';
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
      className={twMerge(
        'flex w-fit cursor-pointer select-none items-center justify-center rounded-full',
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
      {busy && <Spinner className="ml-1" ariaLabel="loading" size={size} />}
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
