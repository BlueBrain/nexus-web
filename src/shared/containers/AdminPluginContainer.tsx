import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Tabs, Collapse, Alert } from 'antd';
import HistoryContainer from '../containers/HistoryContainer';
import ResourceLinksContainer from '../containers/ResourceLinks';
import ResourceActionsContainer from '../containers/ResourceActionsContainer';
import ResourceEditorContainer from '../containers/ResourceEditor';
import GraphContainer from '../containers/GraphContainer';
import MarkdownEditorContainer from './MarkdownEditorContainer';
import { AccessControl } from '@bbp/react-nexus';
import { EditOutlined } from '@ant-design/icons';
import { ResourceLinkAugmented } from '../components/ResourceLinks/ResourceLinkItem';

const { Panel } = Collapse;
const TabPane = Tabs.TabPane;

type AdminProps = {
  editable: boolean;
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
  resource: Resource;
  latestResource: Resource;
  activeTabKey: string;
  expandedFromQuery: string | string[] | null | undefined;
  refProp: React.MutableRefObject<HTMLDivElement>;
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => void;
  handleTabChange: (activeTabKey: string) => void;
  handleGoToInternalLink: (link: ResourceLinkAugmented) => void;
  handleEditFormSubmit: (value: any) => void;
  handleExpanded: (expanded: boolean) => void;
  refreshResource: () => void;
  collapsed: boolean;
  handleCollapseChanged: () => void;
  showFullScreen: boolean;
};

const AdminPlugin: React.FunctionComponent<AdminProps> = ({
  editable,
  orgLabel,
  projectLabel,
  resourceId,
  resource,
  latestResource,
  activeTabKey,
  expandedFromQuery,
  refProp: ref,
  goToResource,
  handleTabChange,
  handleGoToInternalLink,
  handleEditFormSubmit,
  handleExpanded,
  refreshResource,
  collapsed,
  handleCollapseChanged,
  showFullScreen,
}) => {
  const [tabChange, setTabChange] = React.useState<boolean>(false);

  const onTabChange = (tab: string) => {
    // forces a tab to rerender - otherwise RecourceEditor shifts its content left (codemirror issue)
    setTabChange(!tabChange);
    handleTabChange(tab);
  };

  return (
    <Collapse
      onChange={handleCollapseChanged}
      activeKey={collapsed ? 'admin' : undefined}
    >
      <Panel header="Advanced View" key="admin">
        <AccessControl
          path={`/${orgLabel}/${projectLabel}`}
          permissions={['resources/write']}
          noAccessComponent={() => <></>}
        >
          {editable && (
            <Alert
              message={
                <>
                  <EditOutlined /> You can edit this resource.
                </>
              }
              type="success"
            />
          )}
        </AccessControl>

        <ResourceActionsContainer
          editable={editable}
          resource={resource}
          refreshResource={refreshResource}
        />
        <Tabs
          activeKey={activeTabKey}
          onChange={onTabChange}
          tabBarStyle={{ paddingLeft: '1rem' }}
        >
          <TabPane tab="JSON" key="#JSON">
            <ResourceEditorContainer
              resourceId={resource['@id']}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              rev={resource._rev}
              defaultExpanded={
                !!expandedFromQuery && expandedFromQuery === 'true'
              }
              defaultEditable={editable}
              onSubmit={handleEditFormSubmit}
              onExpanded={handleExpanded}
              tabChange={tabChange}
              showFullScreen={showFullScreen}
            />
          </TabPane>
          <TabPane tab="Description" key="#mde">
            <MarkdownEditorContainer
              resourceId={resource['@id']}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              rev={resource._rev}
              readOnly={!editable}
              goToResource={goToResource}
            />
          </TabPane>
          <TabPane tab="History" key="#history">
            <HistoryContainer
              resourceId={resource['@id']}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              latestRev={latestResource._rev}
              link={(rev: number) => {
                return (
                  <a
                    onClick={() => {
                      goToResource(orgLabel, projectLabel, resourceId, {
                        revision: rev,
                      });
                    }}
                  >
                    Revision {rev}
                  </a>
                );
              }}
            />
          </TabPane>
          <TabPane tab="Links" key="#links" className="rows">
            <section className="links incoming">
              <h3>Incoming</h3>
              <ResourceLinksContainer
                resourceId={resource['@id']}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                rev={resource._rev}
                direction="incoming"
                onClick={handleGoToInternalLink}
              />
            </section>
            <section className="links outgoing">
              <h3>Outgoing</h3>
              <ResourceLinksContainer
                resourceId={resource['@id']}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                rev={resource._rev}
                direction="outgoing"
                onClick={handleGoToInternalLink}
              />
            </section>
          </TabPane>
          <TabPane tab="Graph" key="#graph" className="rows">
            <div className="graph-wrapper-container">
              <div className="fixed-minus-header">
                <div ref={ref} className="graph-wrapper">
                  <GraphContainer resource={resource as Resource} />
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Panel>
    </Collapse>
  );
};

export default AdminPlugin;
