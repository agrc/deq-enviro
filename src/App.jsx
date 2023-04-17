import { useRemoteConfigString } from 'reactfire';
import './App.css';
import { fieldNames } from './config';

function App() {
  const queryLayersConfig = useRemoteConfigString('queryLayers');

  if (queryLayersConfig.status === 'loading') {
    console.log('loading remote config');

    return <span>getting configs...</span>;
  }

  const queryLayers = JSON.parse(queryLayersConfig.data);
  console.log('queryLayers', queryLayers);

  return (
    <div className="App">
      <h1>Query Layers</h1>
      {queryLayers.map((queryLayer) => (
        <div key={queryLayer[fieldNames.queryLayers.name]}>
          {queryLayer[fieldNames.queryLayers.name]}
        </div>
      ))}
    </div>
  );
}

export default App;
