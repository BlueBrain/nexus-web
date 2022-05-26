import * as React from 'react';
import { useQuery, useQueries, useInfiniteQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import InfiniteSearch from '../../../shared/components/List/InfiniteSearch';
import StudioList from '../components/StudioList';
import CreateStudioContainer from './CreateStudioContainer';
import { Empty } from 'antd';
import { parseInt } from 'lodash';
const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
const STUDIO_RESULTS_DEFAULT_SIZE = 10;

const StudioListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [next, setNext] = React.useState<number>(0);

  const fetchStudios = async (searchQuery: string) =>
    nexus.Resource.list(orgLabel, projectLabel, {
      size: STUDIO_RESULTS_DEFAULT_SIZE,
      deprecated: false,
      type: DEFAULT_STUDIO_TYPE,
      q: searchQuery,
      from: next,
    });

  const { data, status, error: listError } = useQuery({
    queryKey: ['studios', searchQuery],
    queryFn: async () => await fetchStudios(searchQuery),
    enabled: true,
    retry: 2,
  });

  const studios = data?._results || [];

  const fetchStudio = async (studioId: string) =>
    nexus.Resource.get<Resource>(
      orgLabel,
      projectLabel,
      encodeURIComponent(studioId)
    );

  const results = useQueries(
    studios.map(r => {
      return {
        queryKey: ['studio', r],
        queryFn: async () => await fetchStudio(r['@id']),
      };
    })
  );

  const makeStudioUri = (resourceId: string) => {
    return `/${orgLabel}/${projectLabel}/studios/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToStudio = (resourceId: string) => {
    history.push(makeStudioUri(resourceId));
  };

  const handleLoadMore = async ({ searchValue }: { searchValue: string }) => {
    if (searchValue !== searchQuery) {
      return setSearchQuery(searchValue);
    }
    if (data?._next) {
      setNext(parseInt(data?._next));
    }
  };

  return (
    <div className="studio-list" id={'studio-list'}>
      <CreateStudioContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        goToStudio={goToStudio}
      />
      <br />
      <InfiniteSearch
        dataLength={data?._total || 0}
        onLoadMore={handleLoadMore}
        hasMore={(data?._results.length || 0) < Number(data?._total || 0)}
        defaultSearchValue={searchQuery}
        height={500}
      >
        {status === 'error' || listError !== null ? (
          <Empty description="Sorry, something went wrong" />
        ) : (
          <StudioList
            studios={results
              .filter(r => r.status === 'success')
              .map(r => {
                const resource = r.data as Resource;
                return {
                  id: resource['@id'],
                  name: resource.label,
                  description: resource.description,
                };
              })}
            makeResourceUri={makeStudioUri}
            busy={status === 'loading'}
          ></StudioList>
        )}
      </InfiniteSearch>
    </div>
  );
};

export default StudioListContainer;
