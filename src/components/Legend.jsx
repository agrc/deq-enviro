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

function Swatch({ symbol, opacity }) {
  const divRef = useRef(null);

  useEffect(() => {
    renderPreviewHTML(symbol, { opacity }).then((node) => {
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

export default function Legend({ featureLayer }) {
  const { renderer, opacity, geometryType, fields } = featureLayer;
  const isSimple = renderer.type === 'simple';

  let mainSymbol;
  if (isSimple) {
    mainSymbol = renderer.symbol;
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
      case 'unique-value':
        return (
          <UniqueValue
            groups={renderer.uniqueValueGroups}
            opacity={opacity}
            field={renderer.field}
            fields={fields}
          />
        );

      case 'class-breaks':
        return (
          <ClassBreaks
            infos={renderer.classBreakInfos}
            opacity={opacity}
            field={renderer.field}
            fields={fields}
          />
        );

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
  featureLayer: PropTypes.object.isRequired,
};
