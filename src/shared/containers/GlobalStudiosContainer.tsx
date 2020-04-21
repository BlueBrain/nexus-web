import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, PaginatedList } from '@bbp/nexus-sdk';

import ExpandableStudioList from '../components/Studio/ExpandableStudioList';

const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';

const StudioListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const history = useHistory();
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
      size: 30,
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
  }, [orgLabel, projectLabel]);

  return (
    <ExpandableStudioList
      studios={resources.map(r => ({
        id: r['@id'],
        name: r.label,
        description: r.description,
      }))}
      makeResourceUri={makeStudioUri}
      busy={busy}
      error={error}
      goToStudio={(id: string) => goToStudio(id)}
    ></ExpandableStudioList>
  );
};

export default StudioListContainer;
