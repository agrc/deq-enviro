import { twMerge } from 'tailwind-merge';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {import('tailwind-merge').ClassNameValue} [props.className]
 * @returns {JSX.Element}
 */
export default function Tag({ children, className }) {
  return (
    <span
      className={twMerge(
        'ml-1 rounded-full bg-slate-100 px-2 py-0 text-sm',
        className,
      )}
    >
      {children}
    </span>
  );
}
