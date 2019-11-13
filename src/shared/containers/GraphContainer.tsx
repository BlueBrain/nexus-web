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
import { DEFAULT_ACTIVE_TAB_KEY } from '../views/ResourceView';

const GraphContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const history = useHistory();
  const nexus = useNexusContext();
  const location = useLocation();
  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;

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
          ...response._results.map(link => ({
            classes: `${!(link as Resource)._self ? 'external' : 'internal'}`,
            data: {
              id: link['@id'],
              label: labelOf(link['@id']),
              isExternal: !(link as Resource)._self,
            },
          })),
          // Link Edges
          ...response._results.map(link => ({
            data: {
              id: `edge-${resource['@id']}-${link['@id']}`,
              source: resource['@id'],
              target: link['@id'],
              label: Array.isArray(link.paths)
                ? link.paths.map(pathName => labelOf(pathName)).join(', ')
                : labelOf(link.paths),
            },
          })),
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
        ...response._results.map(link => ({
          classes: `${!(link as Resource)._self ? 'external' : 'internal'}`,
          data: {
            id: link['@id'],
            label: labelOf(link['@id']),
            isExternal: !(link as Resource)._self,
          },
        })),

        // Link Edges
        ...response._results.map(link => ({
          data: {
            id: `edge-${id}-${link['@id']}`,
            source: id,
            target: link['@id'],
            label: Array.isArray(link.paths)
              ? link.paths.map(pathName => labelOf(pathName)).join(', ')
              : labelOf(link.paths),
          },
        })),
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

  if (busy || error) return null;

  return (
    <Graph
      elements={elements}
      onNodeClick={handleNodeClick}
      onNodeExpand={handleNodeExpand}
    />
  );
};

export default GraphContainer;
