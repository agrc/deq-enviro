import PropTypes from 'prop-types';
import { useState } from 'react';
import { downloadFormats, fieldNames } from '../../../functions/common/config';
import Button from '../../utah-design-system/Button';
import Checkbox from '../../utah-design-system/Checkbox';
import Icon from '../../utah-design-system/Icon';
import RadioGroup from '../../utah-design-system/RadioGroup';

export default function Download({ searchResultLayers, mutation }) {
  const relevantResultLayers = searchResultLayers.filter(
    (result) => !result.error && result.features.length > 0
  );
  const [selectedLayers, setSelectedLayers] = useState(
    relevantResultLayers.map(
      (result) => result[fieldNames.queryLayers.uniqueId]
    )
  );

  const getOnChangeHandler = (uniqueId) => (checked) => {
    if (checked) {
      setSelectedLayers([...selectedLayers, uniqueId]);
    } else {
      setSelectedLayers(selectedLayers.filter((layer) => layer !== uniqueId));
    }
  };

  const [format, setFormat] = useState('shapefile');
  const formats = [
    {
      label: 'Shapefile',
      value: downloadFormats.shapefile,
    },
    {
      label: 'GeoJSON',
      value: downloadFormats.geojson,
    },
    {
      label: 'CSV',
      value: downloadFormats.csv,
    },
    // {
    //   label: 'File Geodatabase',
    //   value: downloadFormats.filegdb,
    // },
  ];

  return (
    <div className="flex-1 p-2">
      <h3>Select Data for Download</h3>
      {relevantResultLayers.map((result) => (
        <Checkbox
          checked={selectedLayers.includes(
            result[fieldNames.queryLayers.uniqueId]
          )}
          key={result[fieldNames.queryLayers.uniqueId]}
          label={result[fieldNames.queryLayers.layerName]}
          onCheckedChange={getOnChangeHandler(
            result[fieldNames.queryLayers.uniqueId]
          )}
        ></Checkbox>
      ))}
      <h3 className="mt-2">Format</h3>
      <RadioGroup
        items={formats}
        ariaLabel={'Select a format'}
        value={format}
        onValueChange={setFormat}
      />
      {mutation.isSuccess ? (
        <a
          href={mutation.data.data}
          download="data.zip"
          className="my-4 flex items-center justify-center rounded-md border-2 border-emerald-500 p-3 text-xl font-bold text-emerald-500"
        >
          <Icon className="mr-2" name={Icon.Names.arrowDown} label="download" />{' '}
          Download your Data
        </a>
      ) : null}
      {mutation.isError ? (
        <p className="mt-2 text-red-500">
          There was an error generating your zip file!
        </p>
      ) : null}
      <Button
        appearance={Button.Appearances.solid}
        color={Button.Colors.primary}
        className="mt-4 w-full"
        size={Button.Sizes.xl}
        onClick={() =>
          mutation.mutate({
            layers: searchResultLayers
              .filter((result) =>
                selectedLayers.includes(result[fieldNames.queryLayers.uniqueId])
              )
              .map((result) => ({
                uniqueId: result[fieldNames.queryLayers.uniqueId],
                featureService: result[fieldNames.queryLayers.featureService],
                name: result[fieldNames.queryLayers.layerName],
                objectIds: result.features.map(
                  (feature) => feature.attributes.OBJECTID
                ),
              })),
            format,
          })
        }
        busy={mutation.isLoading}
      >
        Generate Zip File
      </Button>
    </div>
  );
}

Download.propTypes = {
  searchResultLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  mutation: PropTypes.object.isRequired,
};
