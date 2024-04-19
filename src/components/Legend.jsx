import { SimpleFillSymbol, SimpleMarkerSymbol } from '@arcgis/core/symbols';
import { renderPreviewHTML } from '@arcgis/core/symbols/support/symbolUtils';
import omit from 'lodash/omit';
import { useEffect, useRef } from 'react';
import appConfig from '../app-config';
import Tooltip from '../utah-design-system/Tooltip';
import { getAlias } from '../utils';

const classes = {
  point: SimpleMarkerSymbol,
  polygon: SimpleFillSymbol,
};

/**
 * @param {Object} props
 * @param {import('@arcgis/core/symbols/Symbol').default} props.symbol
 * @param {number} props.opacity
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

/**
 * @param {Object} props
 * @param {import('@arcgis/core/symbols/Symbol').default} props.symbol
 * @param {number} props.opacity
 * @param {string} props.label
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

/**
 * @param {Object} props
 * @param {import('@arcgis/core/renderers/support/UniqueValueGroup').default[]} props.groups
 * @param {number} props.opacity
 * @param {string} props.field
 * @param {import('@arcgis/core/layers/support/Field').default[]} props.fields
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

/**
 * @param {Object} props
 * @param {import('@arcgis/core/renderers/support/ClassBreakInfo').default[]} props.infos
 * @param {number} props.opacity
 * @param {string} props.field
 * @param {import('@arcgis/core/layers/support/Field').default[]} props.fields
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

/**
 * @param {Object} props
 * @param {import('@arcgis/core/layers/FeatureLayer').default} props.featureLayer
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
