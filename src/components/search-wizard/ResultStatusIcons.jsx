import PropTypes from 'prop-types';
import Icon from '../../utah-design-system/Icon';
import Spinner from '../../utah-design-system/Spinner';
import Tooltip from '../../utah-design-system/Tooltip';

export default function ResultStatusIcons({ resultConfig, layerName }) {
  const hasError = resultConfig?.error;

  return !resultConfig ? (
    <span className="flex h-7 items-center justify-center">
      <Spinner
        className="mr-1"
        ariaLabel={`searching ${layerName}`}
        size="lg"
      />
    </span>
  ) : hasError ? (
    <Tooltip
      trigger={
        <Icon
          name="error"
          className="mr-1 text-error-500"
          size="lg"
          label="error message"
        />
      }
    >
      {resultConfig.error}
    </Tooltip>
  ) : (
    <Icon
      name="check"
      className="mr-1 text-success-500"
      size="lg"
      label="success"
    />
  );
}

ResultStatusIcons.propTypes = {
  resultConfig: PropTypes.shape({
    error: PropTypes.node,
  }),
  layerName: PropTypes.string.isRequired,
};
