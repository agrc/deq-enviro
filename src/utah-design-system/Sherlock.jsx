import Graphic from '@arcgis/core/Graphic';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import { useCombobox } from 'downshift';
import ky from 'ky';
import { escapeRegExp, sortBy, uniqWith } from 'lodash-es';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import Icon from './Icon';
import Spinner from './Spinner';

const defaultSymbols = {
  polygon: {
    type: 'simple-fill',
    color: [240, 240, 240, 0.5],
    outline: {
      style: 'solid',
      color: [255, 255, 0, 0.5],
      width: 2.5,
    },
  },
  line: {
    type: 'simple-line',
    style: 'solid',
    color: [255, 255, 0],
    width: 5,
  },
  point: {
    type: 'simple-marker',
    style: 'circle',
    color: [255, 255, 0, 0.5],
    size: 10,
  },
};

export default function Sherlock({
  className,
  label,
  maxResultsToDisplay,
  onSherlockMatch = () => {},
  placeHolder,
  provider,
  symbols = defaultSymbols,
}) {
  const handleSelectedItemChange = async ({ selectedItem }) => {
    const searchValue = provider.idField
      ? selectedItem.attributes[provider.idField]
      : selectedItem.attributes[provider.searchField];

    let contextValue;
    if (provider.contextField) {
      contextValue = selectedItem.attributes[provider.contextField];
    }

    const response = await provider.getFeature(searchValue, contextValue);

    const results = response.items;

    const graphics = results.map(
      (result) =>
        new Graphic({
          geometry: result.geometry,
          attributes: result.attributes,
          symbol: symbols[result.geometry.type],
        })
    );

    onSherlockMatch(graphics);
  };

  const [state, setState] = useState({
    items: [],
    loading: false,
    error: false,
    short: true,
    hasMore: false,
  });

  const handleInputValueChange = async ({ inputValue }) => {
    if (inputValue.length <= 2) {
      setState({
        items: [],
        error: false,
        loading: false,
        short: true,
        hasMore: false,
      });

      return;
    }
    const { searchField, contextField } = provider;

    setState({
      items: [],
      error: false,
      loading: true,
      short: false,
      hasMore: false,
    });

    const response = await provider
      .search(inputValue, maxResultsToDisplay)
      .catch((e) => {
        setState({
          items: [],
          error: e.message,
          loading: false,
          short: false,
          hasMore: false,
        });

        console.error(e);
      });

    const iteratee = [`attributes.${searchField}`];
    let hasContext = false;
    if (contextField) {
      iteratee.push(`attributes.${contextField}`);
      hasContext = true;
    }

    let features = uniqWith(response.items, (a, b) => {
      if (hasContext) {
        return (
          a.attributes[searchField] === b.attributes[searchField] &&
          a.attributes[contextField] === b.attributes[contextField]
        );
      } else {
        return a.attributes[searchField] === b.attributes[searchField];
      }
    });

    features = sortBy(features, iteratee);
    let hasMore = false;
    if (features.length > maxResultsToDisplay) {
      features = features.slice(0, maxResultsToDisplay);
      hasMore = true;
    }

    setState({
      items: features,
      loading: false,
      error: false,
      short: false,
      hasMore: hasMore,
    });
  };

  const {
    getInputProps,
    getItemProps,
    highlightedIndex,
    isOpen,
    inputValue,
    setInputValue,
    getMenuProps,
  } = useCombobox({
    onSelectedItemChange: handleSelectedItemChange,
    onInputValueChange: handleInputValueChange,
    items: state.items,
    itemToString: (item) => (item ? item.attributes[provider.searchField] : ''),
  });

  const getMenuItems = () => {
    const commonClasses =
      'rounded-md border border-slate-400 rounded-md px-2 py-1';
    if (state.short) {
      return (
        // primary
        <li
          className={twJoin(commonClasses, 'bg-info-200 text-center')}
          disabled
        >
          Type more than 2 letters.
        </li>
      );
    }

    if (state.error) {
      return (
        <li
          className={twJoin(commonClasses, 'bg-error-200 text-center')}
          disabled
        >
          Error! {state.error}
        </li>
      );
    }

    if (!state.loading && !state.items.length) {
      return (
        <li
          className={twJoin(commonClasses, 'bg-warning-200 text-center')}
          disabled
        >
          No items found.
        </li>
      );
    }

    let items = state.items.map((item, index) => (
      <li
        key={index}
        className={twMerge(
          commonClasses,
          highlightedIndex === index && 'bg-primary text-white',
          'flex items-center justify-between rounded-none border-0 border-x',
          'first:rounded-t-md first:border-t last:rounded-b-md last:border-b'
        )}
        {...getItemProps({
          item,
          index,
        })}
      >
        <Highlighted
          text={item.attributes[provider.searchField]}
          highlight={inputValue}
        ></Highlighted>
        <span className="text-right text-sm">
          {item.attributes[provider.contextField] || ''}
        </span>
      </li>
    ));

    if (state.hasMore) {
      items.push(
        <li
          key="too-many"
          className={twJoin(
            commonClasses,
            'rounded-t-none border-t-0 bg-info-200 text-center'
          )}
          disabled
        >
          More than {maxResultsToDisplay} items found.
        </li>
      );
    }

    return items;
  };

  useEffect(() => {
    setInputValue('');
  }, [provider, setInputValue]);

  return (
    <div className={twMerge('w-full', className)}>
      {label && <strong>{label}</strong>}
      <div className="relative -mx-1 -mb-1 rounded-md p-1 hover:bg-slate-200">
        <div className="absolute bottom-0 left-0 top-0 mx-1 flex w-8 items-center justify-center">
          {state.loading ? (
            <Spinner ariaLabel="searching" />
          ) : (
            <Icon name={Icon.Names.search} label="search" />
          )}
        </div>
        <input
          autoComplete="off"
          className="w-full rounded-md border border-slate-400 py-1 pl-8 pr-2"
          placeholder={placeHolder}
          type="text"
          {...getInputProps()}
        />
      </div>
      <ul
        className={twJoin(
          'mt-1 w-full rounded-md bg-white',
          !isOpen && 'hidden'
        )}
        {...getMenuProps()}
      >
        {isOpen && getMenuItems()}
      </ul>
    </div>
  );
}

Sherlock.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  maxResultsToDisplay: PropTypes.number.isRequired,
  onSherlockMatch: PropTypes.func,
  placeHolder: PropTypes.string,
  provider: PropTypes.object.isRequired,
  symbols: PropTypes.object,
};

const Highlighted = ({ text = '', highlight = '' }) => {
  if (!highlight.trim()) {
    return <div>{text}</div>;
  }

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
  const parts = text.split(regex);

  return (
    <div>
      {parts
        .filter((part) => part)
        .map((part, i) =>
          regex.test(part) ? (
            <mark key={i}>{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
    </div>
  );
};

Highlighted.propTypes = {
  text: PropTypes.string,
  highlight: PropTypes.string,
};

export class ProviderBase {
  controller = new AbortController();
  signal = this.controller.signal;

  getOutFields(outFields, searchField, contextField) {
    outFields = outFields || [];

    // don't mess with '*'
    if (outFields[0] === '*') {
      return outFields;
    }

    const addField = (fld) => {
      if (fld && outFields.indexOf(fld) === -1) {
        outFields.push(fld);
      }
    };

    addField(searchField);
    addField(contextField);

    return outFields;
  }

  getSearchClause(text) {
    return `UPPER(${this.searchField}) LIKE UPPER('%${text}%')`;
  }

  getFeatureClause(searchValue, contextValue) {
    let statement = `${this.searchField}='${searchValue}'`;

    if (this.contextField) {
      if (contextValue && contextValue.length > 0) {
        statement += ` AND ${this.contextField}='${contextValue}'`;
      } else {
        statement += ` AND ${this.contextField} IS NULL`;
      }
    }

    return statement;
  }

  cancelPendingRequests() {
    this.controller.abort();
  }
}

export class MapServiceProvider extends ProviderBase {
  constructor(serviceUrl, searchField, options = {}) {
    super();

    this.searchField = searchField;
    this.contextField = options.contextField;
    this.serviceUrl = serviceUrl;

    this.setUpQueryTask(options);
  }

  async setUpQueryTask(options) {
    const defaultWkid = 3857;
    this.query = new Query();
    this.query.outFields = this.getOutFields(
      options.outFields,
      this.searchField,
      options.contextField
    );
    this.query.returnGeometry = false;
    this.query.outSpatialReference = { wkid: options.wkid || defaultWkid };
  }

  async search(searchString) {
    this.query.where = this.getSearchClause(searchString);
    const featureSet = await executeQueryJSON(this.serviceUrl, this.query);

    return { items: featureSet.features };
  }

  async getFeature(searchValue, contextValue) {
    this.query.where = this.getFeatureClause(searchValue, contextValue);
    this.query.returnGeometry = true;
    const featureSet = await executeQueryJSON(this.serviceUrl, this.query);

    return { items: featureSet.features };
  }
}

export class WebApiProvider extends ProviderBase {
  constructor(apiKey, searchLayer, searchField, options) {
    super();

    const defaultWkid = 3857;

    this.searchLayer = searchLayer;
    this.searchField = searchField;

    if (options) {
      this.wkid = options.wkid || defaultWkid;
      this.contextField = options.contextField;
      this.outFields = this.getOutFields(
        options.outFields,
        this.searchField,
        this.contextField
      );
    } else {
      this.wkid = defaultWkid;
    }

    this.outFields = this.getOutFields(
      null,
      this.searchField,
      this.contextField
    );
    this.webApi = new WebApi(apiKey, this.signal);
  }

  async search(searchString) {
    return await this.webApi.search(this.searchLayer, this.outFields, {
      predicate: this.getSearchClause(searchString),
      spatialReference: this.wkid,
    });
  }

  async getFeature(searchValue, contextValue) {
    return await this.webApi.search(
      this.searchLayer,
      this.outFields.concat('shape@'),
      {
        predicate: this.getFeatureClause(searchValue, contextValue),
        spatialReference: this.wkid,
      }
    );
  }
}

class WebApi {
  constructor(apiKey, signal) {
    this.baseUrl = 'https://api.mapserv.utah.gov/api/v1/';

    // xhrProvider: dojo/request/* provider
    //      The current provider as determined by the search function
    this.xhrProvider = null;

    // Properties to be sent into constructor

    // apiKey: String
    //      web api key (http://developer.mapserv.utah.gov/AccountAccess)
    this.apiKey = apiKey;

    this.signal = signal;
  }

  async search(featureClass, returnValues, options) {
    // summary:
    //      search service wrapper (http://api.mapserv.utah.gov/#search)
    // featureClass: String
    //      Fully qualified feature class name eg: SGID10.Boundaries.Counties
    // returnValues: String[]
    //      A list of attributes to return eg: ['NAME', 'FIPS'].
    //      To include the geometry use the shape@ token or if you want the
    //      envelope use the shape@envelope token.
    // options.predicate: String
    //      Search criteria for finding specific features in featureClass.
    //      Any valid ArcObjects where clause will work. If omitted, a TSQL *
    //      will be used instead. eg: NAME LIKE 'K%'
    // options.geometry: String (not fully implemented)
    //      The point geometry used for spatial queries. Points are denoted as
    //      'point:[x,y]'.
    // options.spatialReference: Number
    //      The spatial reference of the input geographic coordinate pair.
    //      Choose any of the wkid's from the Geographic Coordinate System wkid reference
    //      or Projected Coordinate System wkid reference. 26912 is the default.
    // options.tolerance: Number (not implemented)
    // options.spatialRelation: String (default: 'intersect')
    // options.buffer: Number
    //      A distance in meters to buffer the input geometry.
    //      2000 meters is the maximum buffer.
    // options.pageSize: Number (not implemented)
    // options.skip: Number (not implemented)
    // options.attributeStyle: String
    //      Controls the casing of the attributes that are returned.
    //      Options:
    //
    //      'upper': upper cases all attribute names.
    //      'lower': lower cases all attribute names.
    //      'camel': camel cases all attribute names
    //
    // returns: Promise
    var url = `${this.baseUrl}search/${featureClass}/${encodeURIComponent(
      returnValues.join(',')
    )}?`;

    if (!options) {
      options = {};
    }

    options.apiKey = this.apiKey;

    const response = await ky(url + new URLSearchParams(options), {
      signal: this.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        message: response.message || response.statusText,
      };
    }

    const result = await response.json();

    if (result.status !== 200) {
      return {
        ok: false,
        message: result.message,
      };
    }

    return {
      ok: true,
      items: result.result,
    };
  }
}

export class LocatorSuggestProvider extends ProviderBase {
  searchField = 'text';
  idField = 'magicKey';

  constructor(url, outSRID) {
    super();
    this.url = url;
    this.outSRID = outSRID;
  }

  async search(searchString, maxResults) {
    const suggestUrl = `${
      this.url
    }/suggest?text=${searchString}&maxSuggestions=${maxResults || 10}`;

    let response;
    try {
      response = await fetch(suggestUrl);
      const responseJson = await response.json();
      const features = responseJson.suggestions.map((suggestion) => {
        return {
          attributes: suggestion,
        };
      });

      return { items: features };
    } catch {
      const message = 'error with suggest request';
      console.error(message, response);

      throw new Error(message);
    }
  }

  async getFeature(magicKey) {
    const getFeatureUrl = `${this.url}/findAddressCandidates?magicKey=${magicKey}&outSR={"wkid":${this.outSRID}}`;

    const response = await fetch(getFeatureUrl);
    const responseJson = await response.json();
    const candidate = responseJson.candidates[0];
    candidate.geometry = {
      ...candidate.location,
      type: 'point',
      spatialReference: {
        wkid: this.outSRID,
      },
    };
    // used to zoom to result
    candidate.attributes.extent = {
      ...candidate.extent,
      spatialReference: {
        wkid: this.outSRID,
      },
    };

    return { items: [candidate] };
  }
}
