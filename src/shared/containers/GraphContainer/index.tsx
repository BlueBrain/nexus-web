import * as React from 'react';
import { notification } from 'antd';
import { useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';

import { getResourceLabelsAndIdsFromSelf, getResourceLabel } from '../../utils';
import Graph, { ElementNodeData } from '../../components/Graph';
import GraphControlPanel from '../../components/Graph/GraphControlPanel';

import ResourcePreviewCardContainer from './../ResourcePreviewCardContainer';
import { DEFAULT_ACTIVE_TAB_KEY } from '../../views/ResourceView';
import { createNodesAndEdgesFromResourceLinks, makeNode } from './Graph';
import { DEFAULT_LAYOUT } from '../../components/Graph/LayoutDefinitions';

const GraphContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const history = useHistory();
  const nexus = useNexusContext();
  const location = useLocation();
  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;
  const [reset, setReset] = React.useState(false);
  const [centered, setCentered] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);
  const [layout, setLayout] = React.useState(DEFAULT_LAYOUT);
  const [
    { selectedResourceSelf, isSelectedExternal },
    setSelectedResource,
  ] = React.useState<{
    selectedResourceSelf: string | null;
    isSelectedExternal: boolean | null;
  }>({
    selectedResourceSelf: '',
    isSelectedExternal: null,
  });
  const [elements, setElements] = React.useState<cytoscape.ElementDefinition[]>(
    []
  );
  const [{ error, links, total, next }, setLinks] = React.useState<{
    error: Error | null;
    links: ResourceLink[];
    next: string | null;
    total: number;
  }>({
    next: null,
    error: null,
    links: [],
    total: 0,
  });
  const [loading, setLoading] = React.useState(false);

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

  React.useEffect(() => {
    setLoading(true);

    setLinks({
      next,
      links,
      total,
      error: null,
    });

    let fetchedLinks: ResourceLink[];

    getResourceLinks(resource._self)
      .then(response => {
        fetchedLinks = response._results;

        setLinks({
          next: response._next || null,
          links: fetchedLinks,
          total: response._total,
          error: null,
        });

        return Promise.all(
          fetchedLinks.map(
            async link =>
              await makeNode(link, resource['@id'], getResourceLinks)
          )
        );
      })
      .then(linkNodes => {
        const newElements: cytoscape.ElementDefinition[] = [
          {
            data: {
              id: resource['@id'],
              label: getResourceLabel(resource),
              isOrigin: true,
            },
          },
          // Link Nodes
          ...linkNodes,
          // Link Path Nodes and Edges
          ...createNodesAndEdgesFromResourceLinks(
            fetchedLinks,
            resource['@id'],
            collapsed
          ),
        ];

        setElements(newElements);
        setLoading(false);
      })
      .catch(error => {
        notification.error({
          message: `Could not fetch resource info for node ${resource['@id']}`,
          description: error.message,
        });

        setLoading(false);
      });
  }, [resource._self, reset, collapsed]);

  const handleNodeClick = async (id: string, data: ElementNodeData) => {
    const { isBlankNode, isExternal, isExpandable, self, isExpanded } = data;
    if (isBlankNode || isExternal || !isExpandable || !self || isExpanded) {
      return;
    }
    try {
      setLoading(true);
      // TODO: should get from self not ID if its in another project
      const response = await getResourceLinks(self);

      const targetNode = elements.find(element => element.data.id === id);
      if (!targetNode) {
        return;
      }

      targetNode.data.isExpanded = true;
      setElements([
        ...elements,

        // Link Nodes
        ...(await Promise.all(
          response._results.map(link => makeNode(link, id, getResourceLinks))
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
    setLoading(false);
  };

  const handleVisitResource = (id: string, data: ElementNodeData) => {
    const { isExternal, self } = data;
    if (isExternal) {
      open(id);
      return;
    }
    if (!self) {
      return;
    }
    const {
      orgLabel,
      projectLabel,
      resourceId,
    } = getResourceLabelsAndIdsFromSelf(self);

    history.push(
      `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
        resourceId
      )}${activeTabKey}`
    );
  };

  const showResourcePreview = (id: string, data: ElementNodeData) => {
    const { isBlankNode, isOrigin, self, isExternal } = data;
    if (isBlankNode || isOrigin) {
      return;
    }
    setSelectedResource({
      selectedResourceSelf: self || id,
      isSelectedExternal: isExternal,
    });
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLayoutChange = (layout: string) => {
    setLayout(layout);
  };

  const handleReset = () => {
    setReset(!reset);
  };

  const handleRecenter = () => {
    setCentered(!centered);
  }

  if (error) return null;

  return (
    <>
      <GraphControlPanel
        onReset={handleReset}
        collapsed={collapsed}
        onCollapse={handleCollapse}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        loading={loading}
        onRecenter={handleRecenter}
      />
      <Graph
        elements={elements}
        onNodeClick={handleNodeClick}
        onNodeClickAndHold={handleVisitResource}
        onNodeHover={showResourcePreview}
        layout={layout}
        centered={centered}
      />
      {!!selectedResourceSelf && (
        <ResourcePreviewCardContainer
          resourceSelf={selectedResourceSelf}
          isExternal={isSelectedExternal}
        />
      )}
    </>
  );
};

export default GraphContainer;
