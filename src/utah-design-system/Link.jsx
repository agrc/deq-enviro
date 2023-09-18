import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';

export default function Link({ className, href, external, children }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : ''}
      className={twMerge(
        'inline-flex cursor-pointer items-center text-sky-600 hover:bg-slate-100 hover:text-sky-800',
        className,
      )}
    >
      <span className="underline">{children}</span>
      {external ? (
        <Icon
          className="ml-1"
          name="externalLink"
          label="more info"
          size="xs"
        />
      ) : null}
    </a>
  );
}

Link.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string.isRequired,
  external: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
