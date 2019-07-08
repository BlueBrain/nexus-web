import * as React from 'react';
import { match } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';

interface SearchViewProps {
  match: match<{ org: string; project: string; searchViewId: string }>;
}

const SearchView: React.FunctionComponent<SearchViewProps> = props => {
  const { match } = props;

  const nexus = useNexusContext();
  const [searchView, setSearchView] = React.useState<any>(null);
  const [aggView, setAggView] = React.useState<any>(null);
  const [facets, setFacets] = React.useState<any>(null);

  console.log({ searchView, aggView, facets });

  React.useEffect(() => {
    if (aggView) {
      nexus
        .httpPost({
          body: searchView && searchView.facets,
          path: `${aggView['_self']}/sparql`,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
        .then(res => {
          setFacets(res);
        });
    }
  }, [aggView && aggView['@id']]);

  React.useEffect(() => {
    if (searchView) {
      nexus
        .httpGet({
          path: searchView.view,
        })
        .then(res => {
          setAggView(res);
        });
    }
  }, [searchView && searchView['@id']]);

  React.useEffect(() => {
    nexus.Resource.get(
      match.params.org,
      match.params.project,
      match.params.searchViewId
    ).then(res => {
      setSearchView(res);
    });
  }, [match.url]);

  return (
    <div className="search-view view-container">
      <h1 className="name">Search</h1>
    </div>
  );
};

export default SearchView;
