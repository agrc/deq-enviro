import { SimpleFillSymbol, SimpleMarkerSymbol } from '@arcgis/core/symbols';
import { renderPreviewHTML } from '@arcgis/core/symbols/support/symbolUtils';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import appConfig from '../app-config';
import Tooltip from '../utah-design-system/Tooltip';
import { getAlias } from '../utils';

const classes = {
  point: SimpleMarkerSymbol,
  polygon: SimpleFillSymbol,
};

/**
 * Displays a symbol swatch
 *
 * @returns {JSX.Element}
 */
function Swatch({ symbol, opacity }) {
  const divRef = useRef(null);

  useEffect(() => {
    renderPreviewHTML(symbol, { opacity }).then((node) => {
      if (!divRef.current) return;

      divRef.current.innerHTML = '';
      divRef.current.append(node);
    });
  }, [opacity, symbol]);

  return (
    <div className="flex w-6 items-center justify-center" ref={divRef}></div>
  );
}

Swatch.propTypes = {
  symbol: PropTypes.object.isRequired,
  opacity: PropTypes.number.isRequired,
};

/**
 * Displays a symbol swatch with a label
 *
 * @returns {JSX.Element}
 */
function SwatchWithLabel({ symbol, opacity, label }) {
  return (
    <div className="flex items-center space-x-2" key={label}>
      <Swatch symbol={symbol} opacity={opacity} />
      <span>{label}</span>
    </div>
  );
}

SwatchWithLabel.propTypes = {
  symbol: PropTypes.object.isRequired,
  opacity: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

/**
 * Displays unique value renderer information
 *
 * @returns {JSX.Element}
 */
function UniqueValue({ groups, opacity, field, fields }) {
  return (
    <>
      {groups.map(({ heading, classes }) => (
        <div key={heading}>
          <div className="font-bold">{heading ?? getAlias(field, fields)}</div>
          {classes.map(({ label, symbol }) => (
            <SwatchWithLabel
              symbol={symbol}
              opacity={opacity}
              label={label}
              key={label}
            />
          ))}
        </div>
      ))}
    </>
  );
}

UniqueValue.propTypes = {
  groups: PropTypes.array.isRequired,
  opacity: PropTypes.number.isRequired,
  field: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
};

/**
 * Displays class breaks renderer information
 *
 * @returns {JSX.Element}
 */
function ClassBreaks({ infos, opacity, field, fields }) {
  return (
    <div className="space-y-1">
      <div className="font-bold">{getAlias(field, fields)}</div>
      {infos.map(({ label, symbol }) => (
        <SwatchWithLabel
          symbol={symbol}
          opacity={opacity}
          label={label}
          key={label}
        />
      ))}
    </div>
  );
}

ClassBreaks.propTypes = {
  infos: PropTypes.array.isRequired,
  opacity: PropTypes.number.isRequired,
  field: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
};

/**
 * Legend component for displaying feature layer symbology
 *
 * @returns {JSX.Element}
 */
export default function Legend({ featureLayer }) {
  const { renderer, opacity, geometryType, fields } = featureLayer;
  const isSimple = renderer.type === 'simple';

  let mainSymbol;
  if (isSimple) {
    mainSymbol =
      /** @type {import('@arcgis/core/renderers/SimpleRenderer').default} */ (
        renderer
      ).symbol;
  } else {
    const symbolConfig = omit(appConfig.symbols[geometryType].symbol, ['type']);
    symbolConfig.color = 'white';
    mainSymbol = new classes[geometryType](symbolConfig);
  }

  const swatch = (
    <Swatch symbol={mainSymbol} opacity={isSimple ? opacity : 1} />
  );

  const getPopupContents = () => {
    switch (renderer.type) {
      case 'unique-value': {
        const uniqueValueRenderer =
          /** @type {import('@arcgis/core/renderers/UniqueValueRenderer').default} */ (
            renderer
          );
        return (
          <UniqueValue
            groups={uniqueValueRenderer.uniqueValueGroups}
            opacity={opacity}
            field={uniqueValueRenderer.field}
            fields={fields}
          />
        );
      }

      case 'class-breaks': {
        const classBreaksRenderer =
          /** @type {import('@arcgis/core/renderers/ClassBreaksRenderer').default} */ (
            renderer
          );
        return (
          <ClassBreaks
            infos={classBreaksRenderer.classBreakInfos}
            opacity={opacity}
            field={classBreaksRenderer.field}
            fields={fields}
          />
        );
      }

      default:
        throw new Error(`Unknown renderer type: ${renderer.type}`);
    }
  };

  return isSimple ? (
    swatch
  ) : (
    <Tooltip trigger={<span>{swatch}</span>}>{getPopupContents()}</Tooltip>
  );
}

Legend.propTypes = {
  featureLayer: PropTypes.shape({
    renderer: PropTypes.shape({
      type: PropTypes.string.isRequired,
      symbol: PropTypes.object,
    }).isRequired,
    opacity: PropTypes.number.isRequired,
    geometryType: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
  }).isRequired,
};
