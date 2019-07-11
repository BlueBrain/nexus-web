import * as React from 'react';
import { match } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, List, Switch } from 'antd';
import SideMenu from '../components/Menu/SideMenu';
import FacetList, {
  makeFacets,
  FacetUpdatePayload,
} from '../components/Search/FacetList';
import DatasetList from '../components/Search/Datasets';

interface SearchViewProps {
  match: match<{ org: string; project: string; searchViewId: string }>;
}

const SearchView: React.FunctionComponent<SearchViewProps> = props => {
  const { match } = props;

  const nexus = useNexusContext();
  const [searchView, setSearchView] = React.useState<any>(null);
  const [aggView, setAggView] = React.useState<any>(null);
  const [facets, setFacets] = React.useState<any>(null);
  const [isFilterPanelVisible, setIsFilterPanelVisible] = React.useState(true);
  const [appliedFacets, setAppliedFacets] = React.useState({});

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
          setFacets(makeFacets(res));
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

  const handleUpdateFacets = (facetUpdate: FacetUpdatePayload) => {
    setAppliedFacets({
      ...appliedFacets,
      [facetUpdate.facetName]: facetUpdate.values,
    });
  };

  return (
    <div className="search-view view-container">
      <h1 className="name">
        <Switch
          size="small"
          onChange={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
        ></Switch>{' '}
        Search
      </h1>
      {aggView && (
        <SideMenu
          visible={isFilterPanelVisible}
          onClose={() => setIsFilterPanelVisible(false)}
          side={'left'}
        >
          {facets && (
            <FacetList
              appliedFacets={appliedFacets}
              facets={facets}
              updateFacets={handleUpdateFacets}
            />
          )}
        </SideMenu>
      )}
      <div className="results">
        {searchView && searchView.datasetQueryConfig && aggView && (
          <DatasetList
            datasetQueryConfig={searchView.datasetQueryConfig}
            aggViewSelfID={aggView['_self']}
            appliedFacets={appliedFacets}
          >
            {({ items }: { items: any[] }) =>
              items.map(item => <div>{item}</div>)
            }
          </DatasetList>
        )}
      </div>
    </div>
  );
};

export default SearchView;
