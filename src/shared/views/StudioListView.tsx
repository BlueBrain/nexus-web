import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Spin, Empty } from 'antd';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../store/reducers';
import ExpandableStudioList from '../components/Studio/ExpandableStudioList';
import { getOrgAndProjectFromProjectId } from '../utils';

const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';

const ES_QUERY = {
  query: {
    term: {
      '@type': DEFAULT_STUDIO_TYPE,
    },
  },
};

export type StudioItem = {
  id: string;
  label: string;
  description?: string;
  workspaces?: string[];
  projectLabel: string;
  orgLabel: string;
};

const StudioListView: React.FC = () => {
  const studioView = useSelector((state: RootState) => state.config.studioView);
  const nexus = useNexusContext();
  const history = useHistory();

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
    if (studioView && studioView !== '') {
      setStudios({
        total: 0,
        busy: true,
        error: null,
        studios: [],
      });
      const studioPath = studioView && studioView.split('/');
      const [studiosOrg, studiosProject, studiosView] = studioPath;

      nexus.View.elasticSearchQuery(
        studiosOrg,
        studiosProject,
        studiosView,
        ES_QUERY
      )
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
    } else {
    }
  }, []);

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

  const goToStudio = (studioUrl: string) => {
    history.push(studioUrl);
  };

  if (studioView === '') {
    return (
      <div className="view-container">
        <div className="global-studio-list">
          <h1>Studios</h1>
          <Empty description="There is no Studio list configured. Please contact your administrator." />
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="global-studio-list">
        <h1>Studios</h1>
        <Spin spinning={busy}>
          <ExpandableStudioList
            studios={studios}
            error={error}
            goToStudio={goToStudio}
          />
        </Spin>
      </div>
    </div>
  );
};

export default StudioListView;
