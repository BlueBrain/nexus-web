import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, PaginatedList } from '@bbp/nexus-sdk';
import InfiniteSearch from '../../../shared/components/List/InfiniteSearch';
import StudioList from '../components/StudioList';
import CreateStudioContainer from './CreateStudioContainer';
import { Empty } from 'antd';
const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';

const StudioListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [
    { busy, error, resources, total, next },
    setResources,
  ] = React.useState<{
    busy: boolean;
    error: Error | null;
    resources: Resource<{ label: string; description?: string }>[];
    next: string | null;
    total: number;
  }>({
    next: null,
    busy: false,
    error: null,
    resources: [],
    total: 0,
  });

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
    if (busy || !next) {
      return;
    }
    try {
      setResources({
        next,
        resources,
        total,
        busy: true,
        error: null,
      });
      const response = await nexus.httpGet({
        path: next,
      });

      const newResources = await Promise.all(
        response._results.map((resource: Resource) =>
          nexus.Resource.get(
            orgLabel,
            projectLabel,
            encodeURIComponent(resource['@id'])
          )
        )
      );
      setResources({
        next: response._next || null,
        resources: [
          ...resources,
          ...(newResources as Resource<{
            label: string;
            description: string;
          }>[]),
        ],
        total: response._total,
        busy: false,
        error: null,
      });
    } catch (error) {
      setResources({
        next,
        error,
        resources,
        total,
        busy: false,
      });
    }
  };

  React.useEffect(() => {
    setResources({
      next,
      resources,
      total,
      busy: true,
      error: null,
    });

    let response: PaginatedList<Resource>;

    // get all resources of type studio
    nexus.Resource.list(orgLabel, projectLabel, {
      type: DEFAULT_STUDIO_TYPE,
      deprecated: false,
      size: 10,
      q: searchQuery,
    })
      .then(studioResponse => {
        response = studioResponse;
        return Promise.all(
          response._results.map(resource =>
            nexus.Resource.get(
              orgLabel,
              projectLabel,
              encodeURIComponent(resource['@id'])
            )
          )
        );
      })
      .then(studios => {
        setResources({
          next: response._next || null,
          resources: studios as Resource<{
            label: string;
            description?: string;
          }>[],
          total: response._total,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        setResources({
          next,
          error,
          resources,
          total,
          busy: false,
        });
      });
  }, [orgLabel, projectLabel, searchQuery]);

  return (
    <div className="studio-list">
      <CreateStudioContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        goToStudio={goToStudio}
      />
      <br />
      <InfiniteSearch
        dataLength={resources.length}
        onLoadMore={handleLoadMore}
        hasMore={resources.length < Number(total || 0)}
        defaultSearchValue={searchQuery}
        height={350}
      >
        {error ? (
          <Empty description="Sorry, something went wrong">
            {error.message}
          </Empty>
        ) : (
          <StudioList
            studios={resources.map(r => ({
              id: r['@id'],
              name: r.label,
              description: r.description,
            }))}
            makeResourceUri={makeStudioUri}
            busy={busy}
          ></StudioList>
        )}
      </InfiniteSearch>
    </div>
  );
};

export default StudioListContainer;
