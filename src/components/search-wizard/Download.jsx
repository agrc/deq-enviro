import PropTypes from 'prop-types';
import { downloadFormats, fieldNames } from '../../../functions/common/config';
import Checkbox from '../../utah-design-system/Checkbox';
import RadioGroup from '../../utah-design-system/RadioGroup';

export default function Download({
  searchResultLayers,
  selectedLayers,
  setSelectedLayers,
  format,
  setFormat,
}) {
  const relevantResultLayers = searchResultLayers.filter(
    (result) => !result.error && result.features.length > 0
  );

  const getOnChangeHandler = (uniqueId) => (checked) => {
    if (checked) {
      setSelectedLayers([...selectedLayers, uniqueId]);
    } else {
      setSelectedLayers(selectedLayers.filter((layer) => layer !== uniqueId));
    }
  };

  const formats = [
    {
      label: 'CSV',
      value: downloadFormats.csv,
    },
    {
      label: 'Excel',
      value: downloadFormats.excel,
    },
    {
      label: 'File Geodatabase',
      value: downloadFormats.filegdb,
    },
    {
      label: 'GeoJSON',
      value: downloadFormats.geojson,
    },
    {
      label: 'Shapefile',
      value: downloadFormats.shapefile,
    },
  ];

  return (
    <div className="flex-1 p-2">
      <h3>Select Data for Download</h3>
      {relevantResultLayers.map((searchLayer) => {
        const uniqueId = searchLayer[fieldNames.queryLayers.uniqueId];
        const layerName = searchLayer[fieldNames.queryLayers.layerName];

        return (
          <Checkbox
            key={uniqueId}
            checked={
              searchLayer.supportsExport && selectedLayers.includes(uniqueId)
            }
            label={`${layerName}${
              searchLayer.supportsExport ? '' : ' (download not available)'
            }`}
            onCheckedChange={getOnChangeHandler(uniqueId)}
            disabled={!searchLayer.supportsExport}
          ></Checkbox>
        );
      })}
      <h3 className="mt-2">Format</h3>
      <RadioGroup
        items={formats}
        ariaLabel={'Select a format'}
        value={format}
        onValueChange={setFormat}
      />
    </div>
  );
}

Download.propTypes = {
  searchResultLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedLayers: PropTypes.func.isRequired,
  format: PropTypes.string.isRequired,
  setFormat: PropTypes.func.isRequired,
};
