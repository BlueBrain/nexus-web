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
            label,
            description,
            workspaces,
            orgLabel,
            projectLabel,
            id: studio._id,
          };
        });
      }
    };

    nexus.View.elasticSearchQuery(orgLabel, projectLabel, viewId, query)
      .then(response => {
        const total = response.hits.total.value;
        const studioList = parseStudiosFromES(response);

        setStudios({
          total,
          busy: false,
          error: null,
          studios: studioList,
        });
      })
      .catch(error => {
        setStudios({
          error,
          busy: false,
          studios: [],
          total: 0,
        });
      });
  }, []);

  return (
    <div className="view-container">
      <div className="global-studio-list">
        <h1>Studios</h1>
        <ExpandableStudioList
          studios={studios}
          busy={busy}
          error={error}
        ></ExpandableStudioList>
      </div>
    </div>
  );
};

export default StudioListView;
