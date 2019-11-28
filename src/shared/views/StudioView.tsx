import * as React from 'react';
import { match } from 'react-router';
import { Link } from 'react-router-dom';
import { Tooltip, Icon } from 'antd';

import StudioContainer from '../containers/StudioContainer';

type StudioViewProps = {
  match: match<{
    orgLabel: string;
    projectLabel: string;
    studioId: string;
    workspaceId: string;
    dashboardId: string;
    studioResourceId: string;
  }>;
};

const StudioView: React.FunctionComponent<StudioViewProps> = props => {
  const { match } = props;
  const {
    params: { orgLabel, projectLabel, studioId, workspaceId, dashboardId, studioResourceId},
  } = match;
  return (
    <>
      <div className="project-banner no-bg" style={{ marginBottom: 20 }}>
        <div className="label">
          <h1 className="name">
            <span>
              <Link to="/">
                <Tooltip title="Back to all organizations" placement="right">
                  <Icon type="home" />
                </Tooltip>
              </Link>
              {' | '}
              <Link to={`/${orgLabel}`}>{orgLabel}</Link>
              {' | '}
              <Link to={`/${orgLabel}/${projectLabel}`}>{projectLabel}</Link>
            </span>
          </h1>
        </div>
      </div>
      <StudioContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        studioId={studioId}
        workspaceId={workspaceId}
        dashboardId={dashboardId}
        studioResourceId={studioResourceId}
      />
    </>
  );
};

export default StudioView;
