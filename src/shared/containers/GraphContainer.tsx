import * as React from 'react';
import { notification } from 'antd';
import { useAsyncEffect } from 'use-async-effect';
import { useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';

import {
  getResourceLabelsAndIdsFromSelf,
  getResourceLabel,
  labelOf,
} from '../utils';
import Graph from '../components/Graph';
import ResourcePreviewCardContainer from './ResourcePreviewCardContainer';
import { DEFAULT_ACTIVE_TAB_KEY } from '../views/ResourceView';

const MAX_LABEL_LENGTH = 20;

const makeNode = (link: ResourceLink) => {
  let label = labelOf(link['@id']);
  label =
    label.length > MAX_LABEL_LENGTH
      ? `${label.slice(0, MAX_LABEL_LENGTH)}...`
      : label;
  return {
    classes: `${!(link as Resource)._self ? 'external' : 'internal'}`,
    data: {
      label,
      id: link['@id'],
      isExternal: !(link as Resource)._self,
    },
  };
};

const createNodesAndEdgesFromResourceLinks = (
  resourceLinks: ResourceLink[],
  originId: string
) => {
  return resourceLinks.reduce(
    (pathNodes: cytoscape.ElementDefinition[], link) => {
      const path = Array.isArray(link.paths) ? link.paths : [link.paths];

      const blankNodes = path.map((path: string) =>
        makeBlankNodes(path, originId, link['@id'])
      );

      // connect blank nodes with edges
      const edges = blankNodes.map((blankNode, index) => {
        if (index === 0) {
          return {
            data: {
              id: `edge-${originId}-${blankNode.data.id}`,
              source: originId,
              target: blankNode.data.id,
              label: blankNode.data.pathLabel,
            },
          };
        }
        return {
          data: {
            id: `edge-${blankNode.data.id}-${blankNodes[index - 1].data.id}`,
            source: blankNode.data.id,
            target: blankNodes[index - 1].data.id,
            label: blankNode.data.pathLabel,
          },
        };
      });

      // There's always one more edge than blank node
      return [
        ...pathNodes,
        ...blankNodes,
        ...edges,
        {
          data: {
            id: `edge-${link['@id']}-${blankNodes[blankNodes.length - 1].data.id}`,
            source: blankNodes[blankNodes.length - 1].data.id,
            target: link['@id'],
            label: blankNodes[blankNodes.length - 1].data.pathLabel,
          },
        },
      ];
    },
    []
  );
};

const makeBlankNodes = (path: string, resourceId: string, linkId: string) => {
  const label = labelOf(path);
  return {
    classes: `blank-node`,
    data: {
      id: `${resourceId}-${path}-${linkId}`,
      isBlankNode: true,
      pathLabel: label,
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
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(resource._self);

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
        const response = await nexus.Resource.links(
          orgLabel,
          projectLabel,
          resourceId,
          'outgoing'
        );
        setLinks({
          next: response._next || null,
          links: response._results,
          total: response._total,
          busy: false,
          error: null,
        });

        const newElements: cytoscape.ElementDefinition[] = [
          {
            data: {
              id: resource['@id'],
              label: getResourceLabel(resource),
            },
          },
          // Link Nodes
          ...response._results.map(makeNode),

          // Link Path Nodes and Edges
          ...createNodesAndEdgesFromResourceLinks(
            response._results,
            resource['@id']
          ),
        ];
        setElements(newElements);
      } catch (error) {
        notification.error({
          message: `Could not fetch resource info for node ${resourceId}`,
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
    [resource._self]
  );

  const handleNodeExpand = async (id: string, isExternal: boolean) => {
    if (isExternal) {
      return;
    }
    try {
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
      targetNode.classes = `${targetNode.classes} -visited`;
      targetNode.data.visited = true;
      setElements([
        ...elements,

        // Link Nodes
        ...response._results.map(makeNode),

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
      return;
    }
    
    setSelectedResource(resourceId);
  }

  if (busy || error) return null;

  return (
    <>
      <Graph
        elements={elements}
        onNodeClick={handleNodeClick}
        onNodeExpand={handleNodeExpand}
        onNodeHoverOver={showResourcePreview}
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
