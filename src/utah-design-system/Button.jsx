import { forwardRef, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';
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

/**
 * @param {keyof typeof SIZES} size
 * @returns {keyof typeof SIZES}
 */
function getOneSizeSmaller(size) {
  const lowerIndex = Object.keys(SIZES).indexOf(size) - 1;

  return SIZES[lowerIndex >= 0 ? lowerIndex : 0];
}

/**
 * @param {Object} props
 * @param {keyof typeof APPEARANCES} [props.appearance]
 * @param {boolean} [props.busy]
 * @param {import('react').ReactNode} props.children
 * @param {import('tailwind-merge').ClassNameValue} [props.className]
 * @param {keyof typeof COLORS} [props.color]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.external] If true, the button will open the link in a
 *   new tab. Only applicable if `href` is provided.
 * @param {string} [props.href] If provided, the button will be rendered as an
 *   anchor tag with the provided href.
 * @param {() => void} [props.onClick]
 * @param {keyof typeof SIZES} [props.size] Size of the button. Corresponds with
 *   the tailwind text sizes (base, sm, lg, xl)
 * @param {import('react').Ref<any>} forwardedRef
 * @returns {JSX.Element}
 */
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
      <Icon
        name="arrowRight"
        className="ml-1"
        size={getOneSizeSmaller(size)}
        label="link"
      />
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
export default Button;
