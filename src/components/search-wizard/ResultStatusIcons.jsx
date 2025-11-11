import { CheckIcon, CircleAlertIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import Spinner from '../../utah-design-system/Spinner';
import Tooltip from '../../utah-design-system/Tooltip';

export default function ResultStatusIcons({ resultConfig, layerName }) {
  const hasError = resultConfig?.error;

  return (
    <div className="flex size-6 flex-shrink-0 items-center justify-center">
      {!resultConfig ? (
        <Spinner
          className="mr-1"
          ariaLabel={`searching ${layerName}`}
          size="lg"
        />
      ) : hasError ? (
        <Tooltip
          trigger={
            <CircleAlertIcon
              className="mr-1 text-error-500"
              aria-label="error message"
            />
          }
        >
          {resultConfig.error}
        </Tooltip>
      ) : (
        <CheckIcon className="mr-1 text-success-500" aria-label="success" />
      )}
    </div>
  );
}

ResultStatusIcons.propTypes = {
  resultConfig: PropTypes.shape({
    error: PropTypes.node,
  }),
  layerName: PropTypes.string.isRequired,
};
