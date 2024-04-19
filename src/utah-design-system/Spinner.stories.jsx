import PropTypes from 'prop-types';
import Spinner from './Spinner';

export default {
  title: 'Utah Design System/Spinner',
  component: Spinner,
};

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

function Test({ size }) {
  return (
    <div className="flex items-center justify-start">
      <span className={textSizes[size]}>{`text-${size}`}</span>
      <Spinner ariaLabel="Loading..." size={size} className="ml-1" />
    </div>
  );
}

Test.propTypes = {
  size: PropTypes.oneOf(Object.keys(textSizes)),
};

export const Default = () => (
  <>
    <h3>Sizes</h3>
    <div className="space-y-1">
      <Test size="xs" />
      <Test size="sm" />
      <Test size="base" />
      <Test size="lg" />
      <Test size="xl" />
      <div className="flex items-center justify-start">
        <span>Custom Size (10)</span>
        <Spinner
          ariaLabel="Loading..."
          size="custom"
          className="ml-1 h-10 w-10"
        />
      </div>
    </div>
  </>
);
