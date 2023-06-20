import WebApiSearch from './WebApiSearch';

export default {
  title: 'Filters/WebApiSearch',
  component: WebApiSearch,
};

export const Default = () => (
  <div className="w-80">
    <h1>County</h1>
    <WebApiSearch
      send={console.log}
      layer="boundaries.county_boundaries"
      searchField="name"
      name="County"
      onChange={console.log}
    />

    <h1>City</h1>
    <WebApiSearch
      send={console.log}
      layer="boundaries.municipal_boundaries"
      searchField="name"
      name="City"
      onChange={console.log}
    />
  </div>
);
