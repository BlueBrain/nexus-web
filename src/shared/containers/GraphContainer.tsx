import * as React from 'react';
import { notification } from 'antd';
import { useAsyncEffect } from 'use-async-effect';
import { useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource, PaginatedList } from '@bbp/nexus-sdk';

import {
  getResourceLabelsAndIdsFromSelf,
  getResourceLabel,
  labelOf,
} from '../utils';
import Graph from '../components/Graph';
import ResourcePreviewCardContainer from './ResourcePreviewCardContainer';
import { DEFAULT_ACTIVE_TAB_KEY } from '../views/ResourceView';

const MAX_LABEL_LENGTH = 20;

const makeNode = async (
  link: ResourceLink,
  getResourceLinks: (self: string) => Promise<PaginatedList<ResourceLink>>
) => {
  const isExternal = !(link as Resource)._self;
  let isExpandable = !isExternal; // External resources are never expandable
  if (!isExternal) {
    const response = await getResourceLinks((link as Resource)._self);
    isExpandable = !!response._total;
  }
  let label = labelOf(link['@id']);
  label =
    label.length > MAX_LABEL_LENGTH
      ? `${label.slice(0, MAX_LABEL_LENGTH)}...`
      : label;
  return {
    classes: `${isExternal ? '-external' : '-internal'} ${
      isExpandable ? '-expandable' : '-expanded'
    }`,
    data: {
      label,
      isExternal,
      isExpandable,
      id: link['@id'],
    },
  };
};

const createNodesAndEdgesFromResourceLinks = (
  resourceLinks: ResourceLink[],
  originId: string
) => {
  return resourceLinks.reduce(
    (pathNodes: cytoscape.ElementDefinition[], link) => {
      const paths = Array.isArray(link.paths) ? link.paths : [link.paths];

      const blankNodes = paths
        .map((path, index) => {
          if (index === paths.length - 1) {
            return null;
          }
          return makeBlankNodes(path, originId, link['@id']);
        })
        .filter(Boolean) as cytoscape.ElementDefinition[];

      const edges = paths.map((path, index) => {
        const label = labelOf(path);
        const blankNode = blankNodes[index];
        if (!blankNodes.length) {
          return {
            data: {
              label,
              id: `edge-${originId}-${link['@id']}`,
              source: originId,
              target: link['@id'],
            },
          };
        }
        if (index === 0) {
          return {
            data: {
              label,
              id: `edge-${originId}-${blankNode && blankNode.data.id}`,
              source: originId,
              target: blankNode && blankNode.data.id,
            },
          };
        }
        const prev = blankNodes[index - 1];
        if (index === paths.length - 1) {
          return {
            data: {
              label,
              id: `edge-${prev && prev.data.id}-${link['@id']}`,
              source: prev && prev.data.id,
              target: link['@id'],
            },
          };
        }
        return {
          data: {
            label,
            id: `edge-${prev && prev.data.id}-${blankNode &&
              blankNode.data.id}`,
            source: prev && prev.data.id,
            target: blankNode && blankNode.data.id,
          },
        };
      });

      return [...pathNodes, ...blankNodes, ...edges];
    },
    []
  );
};

const makeBlankNodes = (path: string, resourceId: string, linkId: string) => {
  return {
    classes: `blank-node`,
    data: {
      id: `${resourceId}-${path}-${linkId}`,
      isBlankNode: true,
    },
  };
};

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
  const [selectedResource, setSelectedResource] = React.useState<string>('');
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
            resource['@id']
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
    [resource._self, reset]
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
      targetNode.data.visited = true;
      setElements([
        ...elements,

        // Link Nodes
        ...(await Promise.all(
          response._results.map(link => makeNode(link, getResourceLinks))
        )),

        // Link Path Nodes and Edges
        ...createNodesAndEdgesFromResourceLinks(response._results, id),
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
    if (isExternal) {
      setSelectedResource('');
      return;
    }

    setSelectedResource(resourceId);
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
      />
      {!!selectedResource && (
        <ResourcePreviewCardContainer
          resourceId={selectedResource}
          projectLabel={projectLabel}
          orgLabel={orgLabel}
        />
      )}
    </>
  );
};

export default GraphContainer;
