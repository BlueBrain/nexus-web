import * as React from 'react';
declare const useLinkToDashboardQueryEditor: (
  viewId: string,
  orgLabel: string,
  projectLabel: string
) => {
  linkQueryEditor: (dataQuery: string) => React.ReactElement;
  view:
    | import('@bbp/nexus-sdk').SparqlView
    | import('@bbp/nexus-sdk').ElasticSearchView
    | import('@bbp/nexus-sdk').CompositeView
    | import('@bbp/nexus-sdk').AggregatedElasticSearchView
    | import('@bbp/nexus-sdk').AggregatedSparqlView
    | undefined;
};
export default useLinkToDashboardQueryEditor;
