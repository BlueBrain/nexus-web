import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk/es';
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

  const content = (
    <>
      <ResourceActionsContainer
        editable={editable}
        resource={resource}
        refreshResource={refreshResource}
      />
      <Tabs
        activeKey={activeTabKey}
        onChange={onTabChange}
        items={[
          {
            key: '#JSON',
            label: 'JSON',
            children: (
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
            ),
          },
          {
            key: '#mde',
            label: 'Description',
            children: (
              <MarkdownEditorContainer
                resourceId={resource['@id']}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                rev={resource._rev}
                readOnly={!editable}
                goToResource={goToResource}
              />
            ),
          },
          {
            key: '#history',
            label: 'History',
            children: (
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
            ),
          },
          {
            key: '#links',
            label: 'Links',
            className: 'rows',
            children: (
              <>
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
              </>
            ),
          },
          {
            key: '#graph',
            label: 'Graph',
            className: 'rows',
            children: (
              <div className="graph-wrapper-container">
                <div className="fixed-minus-header">
                  <div ref={ref} className="graph-wrapper">
                    <GraphContainer resource={resource as Resource} />
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      ></Tabs>
    </>
  );

  return (
    <Collapse
      onChange={handleCollapseChanged}
      activeKey={collapsed ? 'admin' : undefined}
      items={[
        {
          key: 'admin',
          label: 'Advanced View',
          children: content,
        },
      ]}
    />
  );
};

export default AdminPlugin;
