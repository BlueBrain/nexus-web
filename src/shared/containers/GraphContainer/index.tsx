import * as React from 'react';
import { notification } from 'antd';
import { useAsyncEffect } from 'use-async-effect';
import { useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';

import { getResourceLabelsAndIdsFromSelf, getResourceLabel } from '../../utils';
import Graph, { DEFAULT_LAYOUT } from '../../components/Graph';
import ResourcePreviewCardContainer from './../ResourcePreviewCardContainer';
import { DEFAULT_ACTIVE_TAB_KEY } from '../../views/ResourceView';
import { createNodesAndEdgesFromResourceLinks, makeNode } from './Graph';

const GraphContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const history = useHistory();
  const nexus = useNexusContext();
  const location = useLocation();
  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;
  const { orgLabel, projectLabel } = getResourceLabelsAndIdsFromSelf(
    resource._self
  );
  const [reset, setReset] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);
  const [layout, setLayout] = React.useState(DEFAULT_LAYOUT);
  const [
    { selectedResourceId, isSelectedExternal },
    setSelectedResource,
  ] = React.useState<{
    selectedResourceId: string;
    isSelectedExternal: boolean | null;
  }>({
    selectedResourceId: '',
    isSelectedExternal: null,
  });
  const [elements, setElements] = React.useState<cytoscape.ElementDefinition[]>(
    []
  );
  const [{ busy, error, links, total, next }, setLinks] = React.useState<{
    busy: boolean;
    error: Error | null;
    links: ResourceLink[];
    next: string | null;
    total: number;
  }>({
    next: null,
    busy: false,
    error: null,
    links: [],
    total: 0,
  });

  const getResourceLinks = async (self: string) => {
    const {
      orgLabel,
      projectLabel,
      resourceId,
    } = getResourceLabelsAndIdsFromSelf(self);
    return await nexus.Resource.links(
      orgLabel,
      projectLabel,
      resourceId,
      'outgoing'
    );
  };

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return;
      }
      try {
        setLinks({
          next,
          links,
          total,
          busy: true,
          error: null,
        });
        const response = await getResourceLinks(resource._self);
        setLinks({
          next: response._next || null,
          links: response._results,
          total: response._total,
          busy: false,
          error: null,
        });
        const newElements: cytoscape.ElementDefinition[] = [
          {
            classes: '-expandable -main',
            data: {
              id: resource['@id'],
              label: getResourceLabel(resource),
            },
          },
          // Link Nodes
          ...(await Promise.all(
            response._results.map(link => makeNode(link, getResourceLinks))
          )),

          // Link Path Nodes and Edges
          ...createNodesAndEdgesFromResourceLinks(
            response._results,
            resource['@id'],
            collapsed
          ),
        ];
        setElements(newElements);
      } catch (error) {
        notification.error({
          message: `Could not fetch resource info for node ${resource['@id']}`,
          description: error.message,
        });
        setLinks({
          next,
          error,
          links,
          total,
          busy: false,
        });
      }
    },
    [resource._self, reset, collapsed]
  );

  const handleNodeExpand = async (id: string, isExternal: boolean) => {
    if (isExternal) {
      return;
    }
    try {
      // TODO: should get from self not ID if its in another project
      const response = await nexus.Resource.links(
        orgLabel,
        projectLabel,
        encodeURIComponent(id),
        'outgoing'
      );

      const targetNode = elements.find(element => element.data.id === id);
      if (!targetNode) {
        return;
      }
      targetNode.classes = (targetNode.classes || '').replace(
        '-expandable',
        '-expanded'
      );
      targetNode.data.isExpandable = false;
      setElements([
        ...elements,

        // Link Nodes
        ...(await Promise.all(
          response._results.map(link => makeNode(link, getResourceLinks))
        )),

        // Link Path Nodes and Edges
        ...createNodesAndEdgesFromResourceLinks(
          response._results,
          id,
          collapsed
        ),
      ]);
    } catch (error) {
      notification.error({
        message: `Could not fetch resource info for node ${id}`,
        description: error.message,
      });
    }
  };

  const handleReset = () => {
    setReset(!reset);
  };

  const handleNodeClick = (id: string, isExternal: boolean) => {
    if (isExternal) {
      open(id);
      return;
    }
    history.push(
      `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
        id
      )}${activeTabKey}`
    );
  };

  const showResourcePreview = (resourceId: string, isExternal: boolean) => {
    setSelectedResource({
      selectedResourceId: resourceId,
      isSelectedExternal: isExternal,
    });
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLayoutChange = (layout: string) => {
    setLayout(layout);
  };

  if (busy || error) return null;

  return (
    <>
      <Graph
        elements={elements}
        onNodeClick={handleNodeClick}
        onNodeExpand={handleNodeExpand}
        onNodeHoverOver={showResourcePreview}
        onReset={handleReset}
        collapsed={collapsed}
        onCollapse={handleCollapse}
        onLayoutChange={handleLayoutChange}
        layout={layout}
      />
      {!!selectedResourceId && (
        <ResourcePreviewCardContainer
          resourceId={selectedResourceId}
          projectLabel={projectLabel}
          orgLabel={orgLabel}
          isExternal={isSelectedExternal}
        />
      )}
    </>
  );
};

export default GraphContainer;
