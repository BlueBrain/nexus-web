import * as React from 'react';
import { notification } from 'antd';
import { useAsyncEffect } from 'use-async-effect';
import { useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';

import { getResourceLabelsAndIdsFromSelf, getResourceLabel } from '../../utils';
import Graph, { DEFAULT_LAYOUT, ElementNodeData } from '../../components/Graph';
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
    { selectedResourceSelf, isSelectedExternal },
    setSelectedResource,
  ] = React.useState<{
    selectedResourceSelf: string;
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
          fetchedLinks.map(async link => await makeNode(link, getResourceLinks))
        );
      })
      .then(linkNodes => {
        const newElements: cytoscape.ElementDefinition[] = [
          {
            classes: '-expandable -main',
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
    const { isBlankNode, isExternal, isExpandable, self } = data;
    if (isBlankNode || isExternal || !isExpandable || !self) {
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
    setLoading(false);
  };

  const handleReset = () => {
    setReset(!reset);
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
    const { isBlankNode, self, isExternal } = data;
    if (isBlankNode || !self) {
      return;
    }
    setSelectedResource({
      selectedResourceSelf: self,
      isSelectedExternal: isExternal,
    });
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLayoutChange = (layout: string) => {
    setLayout(layout);
  };

  if (error) return null;

  return (
    <>
      <Graph
        elements={elements}
        onNodeClick={handleNodeClick}
        onNodeClickAndHold={handleVisitResource}
        onNodeHover={showResourcePreview}
        onReset={handleReset}
        collapsed={collapsed}
        onCollapse={handleCollapse}
        onLayoutChange={handleLayoutChange}
        layout={layout}
        loading={loading}
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
