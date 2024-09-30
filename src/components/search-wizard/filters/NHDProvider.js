import { getFunctions, httpsCallable } from 'firebase/functions';
import { ProviderBase } from '../../../utah-design-system/Sherlock';

export default class NHDProvider extends ProviderBase {
  searchField = 'gnis_name';
  contextField = 'county_name';

  constructor() {
    super();

    const functions = getFunctions();
    this.searchFunction = httpsCallable(functions, 'search');
    this.getFeatureFunction = httpsCallable(functions, 'getFeature');
  }

  // @ts-expect-error
  async search(searchString) {
    const results = await this.searchFunction(searchString);

    return results.data;
  }

  async getFeature(match, context) {
    const results = await this.getFeatureFunction({ match, context });

    // @ts-expect-error
    return { items: [results.data.feature] };
  }
}
