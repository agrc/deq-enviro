import { ArrowRightIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { forwardRef, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Spinner from './Spinner';

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
  sm: 'text-sm px-3 py-0',
  base: 'px-7 py-1 min-h-[2rem]',
  lg: 'text-lg px-8 py-2 min-h-[2.5rem]',
  xl: 'text-xl px-10 py-2 min-h-[3rem]',
};

const ICON_SIZES = {
  xs: 'size-3',
  sm: 'size-4',
  base: 'size-5',
  lg: 'size-6',
  xl: 'size-7',
};

function getOneSizeSmaller(size) {
  const keys = Object.keys(SIZES);
  const sizeIndex = keys.indexOf(size);
  if (sizeIndex === -1) {
    // If the size is invalid, return the base icon size as a fallback
    return ICON_SIZES.base;
  }
  const lowerIndex = sizeIndex - 1;
  const finalIndex = lowerIndex >= 0 ? lowerIndex : 0;
  return ICON_SIZES[keys[finalIndex]];
}

function InnerButton(
  {
    appearance = 'outlined',
    busy = false,
    children,
    className,
    color = 'none',
    disabled = false,
    external,
    href,
    onClick,
    size = 'base',
  },
  forwardedRef,
) {
  if (busy) {
    disabled = true;
  }

  const internalRef = useRef();

  const ref = forwardedRef || internalRef;

  const calculatedClassName = twMerge(
    'flex w-fit cursor-pointer select-none items-center justify-center rounded-full leading-4',
    appearance === APPEARANCES.outlined && 'border-2',
    COLORS[color][appearance],
    SIZES[size],
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-opacity-50',
    'hover:text-white',
    !disabled && 'active:scale-95 active:shadow-inner',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className,
  );

  return href ? (
    <a
      href={href}
      className={calculatedClassName}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : ''}
      ref={ref}
      onClick={onClick}
    >
      {children}
      <ArrowRightIcon className={`ml-1 ${getOneSizeSmaller(size)}`} />
    </a>
  ) : (
    <button
      className={calculatedClassName}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
    >
      {children}
      {busy && <Spinner className="ml-1" ariaLabel="loading" size={size} />}
    </button>
  );
}

const Button = forwardRef(InnerButton);

Button.propTypes = {
  appearance: PropTypes.oneOf(Object.keys(APPEARANCES)),
  busy: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.oneOf(Object.keys(COLORS)),
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  href: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(Object.keys(SIZES)),
};

InnerButton.propTypes = {
  appearance: PropTypes.oneOf(Object.keys(APPEARANCES)),
  busy: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.oneOf(Object.keys(COLORS)),
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  href: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(Object.keys(SIZES)),
};

export default Button;
