import * as React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';
import { useAsyncEffect } from 'use-async-effect';
import {
  OrgResponseCommon,
  ProjectResponseCommon,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Spin, notification, Popover } from 'antd';

import ViewStatisticsContainer from '../components/Views/ViewStatisticsProgress';

const ProjectView: React.FunctionComponent<{
  match: match<{ orgLabel: string; projectLabel: string }>;
}> = ({ match }) => {
  const nexus = useNexusContext();

  const {
    params: { orgLabel, projectLabel },
  } = match;

  const [{ org, project, busy, error }, setState] = React.useState<{
    org: OrgResponseCommon | null;
    project: ProjectResponseCommon | null;
    busy: boolean;
    error: Error | null;
  }>({
    org: null,
    project: null,
    busy: false,
    error: null,
  });

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return;
      }
      try {
        setState({
          org,
          project,
          error: null,
          busy: true,
        });
        const activeOrg = await nexus.Organization.get(orgLabel);
        const activeProject = await nexus.Project.get(orgLabel, projectLabel);
        setState({
          org: activeOrg,
          project: activeProject,
          busy: false,
          error: null,
        });
      } catch (error) {
        notification.error({
          message: 'Could not load project',
          description: error.message,
        });
        setState({
          org,
          project,
          error,
          busy: false,
        });
      }
    },
    [orgLabel, projectLabel]
  );

  return (
    <Spin spinning={busy}>
      <div className="project-view">
        {!!project && !!org && (
          <div className="project-banner">
            <div className="label">
              <h1 className="name">
                {' '}
                {org && (
                  <span>
                    <a onClick={() => {}}>{org._label}</a> |{' '}
                  </span>
                )}{' '}
                {project._label}
                {'  '}
              </h1>
              <div style={{ marginLeft: 10 }}>
                <ViewStatisticsContainer
                  orgLabel={org._label}
                  projectLabel={project._label}
                  resourceId={DEFAULT_ELASTIC_SEARCH_VIEW_ID}
                />
              </div>
              {!!project.description && (
                <Popover
                  title={project._label}
                  content={
                    <div style={{ width: 300 }}>{project.description}</div>
                  }
                >
                  <div className="description">{project.description}</div>
                </Popover>
              )}
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
};

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  null,
  mapDispatchToProps
)(ProjectView);
