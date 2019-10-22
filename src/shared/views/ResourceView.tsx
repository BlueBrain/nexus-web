import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import { match } from 'react-router';
import { Spin, Card, Empty, Tabs } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import ResourceEditor from '../components/Resources/ResourceEditor';
import MetadataCardComponent from '../components/MetadataCard';
import { getResourceLabel } from '../utils';

const TabPane = Tabs.TabPane;

interface ResourceViewProps {
  match: match<{ org: string; project: string; resourceId: string }>;
  goToOrg: (orgLabel: string) => void;
  goToProject: (orgLabel: string, projectLabel: string) => void;
}

const ResourceView: React.FunctionComponent<ResourceViewProps> = props => {
  const { match, goToOrg, goToProject } = props;
  const {
    params: { org: orgLabel, project: projectLabel, resourceId },
  } = match;
  const nexus = useNexusContext();

  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    // TODO remove once SDK is updated to allow generic Resource Types
    resource: Resource & { [key: string]: any } | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });

  React.useEffect(() => {
    setResource({
      error: null,
      resource: null,
      busy: true,
    });
    nexus.Resource.get(orgLabel, projectLabel, resourceId)
      .then(resource => {
        setResource({
          resource,
          error: null,
          busy: false,
        });
      })
      .catch(error => {
        setResource({
          error,
          resource: null,
          busy: false,
        });
      });
  }, [orgLabel, projectLabel, resourceId]);

  return (
    <div className="resource-view view-container">
      {!!resource && (
        <Helmet
          title={`${getResourceLabel(
            resource
          )} | ${projectLabel} | ${orgLabel} | Nexus Web`}
          meta={[
            {
              name: 'description',
              content: getResourceLabel(resource),
            },
          ]}
        />
      )}
      <div className="resource-details" style={{ width: '100%' }}>
        <Spin spinning={busy} style={{ width: '100%' }}>
          {!!error && (
            <Card>
              <Empty
                description={'There was a problem loading this resource...'}
              />
            </Card>
          )}
          {!!resource && !error && (
            <>
              <h1 className="name">
                <span>
                  <a onClick={() => goToOrg(orgLabel)}>{orgLabel}</a> |{' '}
                  <a onClick={() => goToProject(orgLabel, projectLabel)}>
                    {projectLabel}
                  </a>{' '}
                  |{' '}
                </span>
                {getResourceLabel(resource)}
              </h1>
              <MetadataCardComponent resource={resource} />
              <Tabs defaultActiveKey="1">
                <TabPane tab="JSON" key="1">
                  {/* <ResourceEditor
                    // expanded={expanded}
                    editable={true}
                    rawData={resource}
                    onFormatChange={() => {}}
                    onSubmit={() => {}}
                  /> */}
                </TabPane>
                <TabPane tab="History" key="history">
                  <h1>History Container Goes Here</h1>
                </TabPane>
                <TabPane tab="Links" key="2">
                  <h1>Links Container Goes Here</h1>
                </TabPane>
              </Tabs>
            </>
          )}
        </Spin>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    goToProject: (orgLabel: string, projectLabel: string) =>
      dispatch(push(`/${orgLabel}/${projectLabel}`)),
    goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(ResourceView);
