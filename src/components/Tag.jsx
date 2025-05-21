import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

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

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
