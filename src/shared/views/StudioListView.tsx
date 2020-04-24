import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { getOrgAndProjectFromProjectId } from '../utils';

import ExpandableStudioList from '../components/Studio/ExpandableStudioList';

const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';

export type StudioItem = {
  id: string;
  label: string;
  description?: string;
  workspaces?: string[];
  projectLabel: string;
  orgLabel: string;
};

const StudioListView: React.FC = () => {
  const nexus = useNexusContext();

  const [{ busy, error, studios, total }, setStudios] = React.useState<{
    busy: boolean;
    error: Error | null;
    studios: StudioItem[];
    total: number;
  }>({
    busy: false,
    error: null,
    studios: [],
    total: 0,
  });

  React.useEffect(() => {
    const orgLabel = 'studios';
    const projectLabel = 'aggregate-view';
    const viewId = 'nxv:studioList';
    const query = {
      query: {
        term: {
          '@type': DEFAULT_STUDIO_TYPE,
        },
      },
    };

    const parseStudiosFromES = (response: any) => {
      const results = response.hits;

      if (results && results.hits && results.hits.length) {
        return results.hits.map((studio: any) => {
          const source = JSON.parse(studio._source._original_source);
          const { orgLabel, projectLabel } = getOrgAndProjectFromProjectId(
            studio._source._project
          );
          const { label, description, workspaces } = source;

          return {
            id: studio._id,
            label,
            description,
            workspaces,
            orgLabel,
            projectLabel,
          };
        });
      }
    };

    nexus.View.elasticSearchQuery(orgLabel, projectLabel, viewId, query)
      .then(response => {
        const total = response.hits.total.value;
        const studioList = parseStudiosFromES(response);

        setStudios({
          busy: false,
          error: null,
          studios: studioList,
          total,
        });
      })
      .catch(error => {
        setStudios({
          busy: false,
          error,
          studios: [],
          total: 0,
        });
      });

    // setResources({
    //   next,
    //   resources,
    //   total,
    //   busy: true,
    //   error: null,
    // });

    // let response: PaginatedList<Resource>;

    // // get all resources of type studio
    // nexus.Resource.list(orgLabel, projectLabel, {
    //   type: DEFAULT_STUDIO_TYPE,
    //   deprecated: false,
    //   size: 30,
    // })
    //   .then(studioResponse => {
    //     response = studioResponse;
    //     return Promise.all(
    //       response._results.map(resource =>
    //         nexus.Resource.get(
    //           orgLabel,
    //           projectLabel,
    //           encodeURIComponent(resource['@id'])
    //         )
    //       )
    //     );
    //   })
    //   .then(studios => {
    //     setResources({
    //       next: response._next || null,
    //       resources: studios as Resource<{
    //         label: string;
    //         description?: string;
    //       }>[],
    //       total: response._total,
    //       busy: false,
    //       error: null,
    //     });
    //   })
    //   .catch(error => {
    //     setResources({
    //       next,
    //       error,
    //       resources,
    //       total,
    //       busy: false,
    //     });
    //   });
  }, []);

  const loadWorkspaces = async (studioId: string) => {
    await nexus.Resource.get('studios', 'Test', encodeURIComponent(studioId))
      .then(response => {
        // const studioResource: StudioResource = response as StudioResource;
        // const workspaceIds: string[] = studioResource['workspaces'];
        // console.log('workspaceIds', workspaceIds);
      })
      .catch(error => console.log('error', error));
  };

  console.log('studios', studios);

  return (
    <div className="view-container">
      <div className="global-studio-list">
        <h1>Studios</h1>
        <ExpandableStudioList
          studios={studios}
          busy={busy}
          error={error}
          loadWorkspaces={loadWorkspaces}
        ></ExpandableStudioList>
      </div>
    </div>
  );
};

export default StudioListView;
