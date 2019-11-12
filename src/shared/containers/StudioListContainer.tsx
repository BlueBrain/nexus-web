import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { RootState } from '../store/reducers';
import StudioList from '../components/Studio/StudioList';

const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';

const StudioListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const [
    { busy, error, resources, total, next },
    setResources,
  ] = React.useState<{
    busy: boolean;
    error: Error | null;
    resources: Resource[];
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
    return `${basePath}/${orgLabel}/${projectLabel}/studios/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToStudio = (resourceId: string) => {
    history.push(makeStudioUri(resourceId));
  };

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
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
        const response = await nexus.Resource.list(orgLabel, projectLabel, {
          type: DEFAULT_STUDIO_TYPE,
        });
        setResources({
          next: response._next || null,
          resources: response._results,
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
    },
    [
      // Reset pagination and reload based on these props
      orgLabel,
      projectLabel,
    ]
  );

  return (
    <StudioList
      studios={resources.map(r => ({
        id: r['@id'],
        name: r['@id'], // TODO: Nexus does not return metadata when we use the Resource API. We will have to fetch metadata from ES https://github.com/BlueBrain/nexus/issues/858
        description: r.description,
      }))}
      busy={busy}
      error={error}
      goToStudio={(id: string) => goToStudio(id)}
    ></StudioList>
  );
};

export default StudioListContainer;
