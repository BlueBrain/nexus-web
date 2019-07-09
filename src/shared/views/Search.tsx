import * as React from 'react';
import { match } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, List } from 'antd';
import SideMenu from '../components/Menu/SideMenu';

interface SearchViewProps {
  match: match<{ org: string; project: string; searchViewId: string }>;
}

const SearchView: React.FunctionComponent<SearchViewProps> = props => {
  const { match } = props;

  const nexus = useNexusContext();
  const [searchView, setSearchView] = React.useState<any>(null);
  const [aggView, setAggView] = React.useState<any>(null);
  const [facets, setFacets] = React.useState<any>(null);

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
      {aggView && (
        <SideMenu
          title={'Projects'}
          visible={true}
          onClose={() => {}}
          side={'left'}
        >
          <List
            dataSource={aggView.views.map(
              ({ project }: { project: string }) => project
            )}
            renderItem={(item: string) => <div>{item}</div>}
          />
        </SideMenu>
      )}
    </div>
  );
};

export default SearchView;
