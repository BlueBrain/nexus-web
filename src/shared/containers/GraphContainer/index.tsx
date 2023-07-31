import * as React from 'react';
import { useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource } from '@bbp/nexus-sdk/es';

import { getResourceLabel, getOrgAndProjectFromResource } from '../../utils';
import Graph, { ElementNodeData } from '../../components/Graph';
import GraphControlPanel from '../../components/Graph/GraphControlPanel';

import ResourcePreviewCardContainer from './../ResourcePreviewCardContainer';
import { DEFAULT_ACTIVE_TAB_KEY } from '../../containers/ResourceViewContainer';
import {
  createNodesAndEdgesFromResourceLinks,
  makeNode,
  getListOfChildrenRecursive,
} from './Graph';
import { DEFAULT_LAYOUT } from '../../components/Graph/LayoutDefinitions';
import useNotification from '../../hooks/useNotification';
import { TError } from '../../../utils/types';

const GraphContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const history = useHistory();
  const nexus = useNexusContext();
  const location = useLocation();
  const notification = useNotification();
  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;
  const [reset, setReset] = React.useState(false);
  const [centered, setCentered] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);
  const [layout, setLayout] = React.useState(DEFAULT_LAYOUT);
  const [selectedResource, setSelectedResource] = React.useState<{
    resourceData?: ElementNodeData['resourceData'];
    absoluteAddress: string;
  } | null>(null);
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

  const getResourceLinks = async (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    return await nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(resourceId),
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

    const { orgLabel, projectLabel } = getOrgAndProjectFromResource(resource)!;

    getResourceLinks(orgLabel, projectLabel, resource['@id'])
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
    const {
      isBlankNode,
      isExternal,
      isExpandable,
      resourceData,
      isExpanded,
    } = data;
    if (isBlankNode || isExternal || !resourceData) {
      return;
    }
    try {
      // Un-expand Node
      if (isExpanded && isExpandable) {
        const elementsToRemove = getListOfChildrenRecursive(id, elements);

        const newElements = elements.filter(
          element => !elementsToRemove.includes(element.data.id || '')
        );

        setElements([...newElements]);
        return;
      }

      // Expand Node
      setLoading(true);
      const response = await getResourceLinks(
        resourceData.orgLabel,
        resourceData.projectLabel,
        resourceData.resourceId
      );

      const targetNode = elements.find(element => element.data.id === id);
      if (!targetNode) {
        return;
      }

      targetNode.data.isExpanded = true;

      const newNodes = await Promise.all(
        response._results.map(link => makeNode(link, id, getResourceLinks))
      );

      setElements([
        ...elements,

        // Link Nodes
        ...newNodes.filter((node: { data: ElementNodeData }) => {
          // Because some nodes, once expanded,
          // point to nodes already on the graph
          // we want to make sure to remove these
          // to avoid duplication
          return !elements
            .map(element => element.data.id || '')
            .includes(node.data.id);
        }),

        // Link Path Nodes (Blank Nodes) and Edges
        ...createNodesAndEdgesFromResourceLinks(
          response._results,
          id,
          collapsed
        ),
      ]);
    } catch (error) {
      notification.error({
        message: `Could not fetch resource info for node ${id}`,
        description: (error as TError).message,
      });
    }
    setLoading(false);
  };

  const handleVisitResource = (id: string, data: ElementNodeData) => {
    const { isExternal, resourceData } = data;
    if (isExternal) {
      open(id);
      return;
    }
    if (!resourceData) {
      return;
    }

    const { orgLabel, projectLabel, resourceId } = resourceData;

    history.push(
      `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
        resourceId
      )}${activeTabKey}`
    );
  };

  const showResourcePreview = (id: string, data: ElementNodeData) => {
    const { isBlankNode, resourceData } = data;
    if (isBlankNode) {
      return;
    }
    setSelectedResource({
      resourceData,
      absoluteAddress: resourceData ? resourceData.self : id,
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
  };

  if (error) return null;

  return (
    <>
      <GraphControlPanel
        label={getResourceLabel(resource)}
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
      {!!selectedResource && (
        <ResourcePreviewCardContainer
          resourceData={selectedResource.resourceData}
          absoluteAddress={selectedResource.absoluteAddress}
        />
      )}
    </>
  );
};

export default GraphContainer;
