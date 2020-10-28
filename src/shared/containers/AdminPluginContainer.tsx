import * as React from 'react';
import { Resource, ResourceLink } from '@bbp/nexus-sdk';
import { Tabs, Collapse } from 'antd';
import HistoryContainer from '../containers/HistoryContainer';
import ResourceLinksContainer from '../containers/ResourceLinks';
import ResourceActionsContainer from '../containers/ResourceActionsContainer';
import ResourceEditorContainer from '../containers/ResourceEditor';
import SchemaLinkContainer from '../containers/SchemaLink';
import GraphContainer from '../containers/GraphContainer';
import ResourceMetadata from '../components/ResourceMetadata';

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
  defaultActiveKey: string;
  expandedFromQuery: string | string[] | null | undefined;
  ref: React.MutableRefObject<HTMLDivElement>;
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
  handleGoToInternalLink: (link: ResourceLink) => void;
  handleEditFormSubmit: (value: any) => void;
  handleExpanded: (expanded: boolean) => void;
};

const AdminPlugin: React.FunctionComponent<AdminProps> = ({
  editable,
  orgLabel,
  projectLabel,
  resourceId,
  resource,
  latestResource,
  activeTabKey,
  defaultActiveKey,
  expandedFromQuery,
  ref,
  goToResource,
  handleTabChange,
  handleGoToInternalLink,
  handleEditFormSubmit,
  handleExpanded,
}) => {
  return (
    <Collapse defaultActiveKey={defaultActiveKey} onChange={() => {}}>
      <Panel header="Admin" key="1">
        <ResourceActionsContainer resource={resource} />
        <ResourceMetadata
          resource={resource}
          schemaLink={SchemaLinkContainer}
        />
        <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
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
                  {resource ? (
                    <GraphContainer resource={resource as Resource} />
                  ) : null}
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
