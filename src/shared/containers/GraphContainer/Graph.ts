import { ResourceLink, PaginatedList, Resource } from '@bbp/nexus-sdk';

import { labelOf } from '../../utils';

const MAX_LABEL_LENGTH = 20;

export const makeNode = async (
  link: ResourceLink,
  getResourceLinks: (self: string) => Promise<PaginatedList<ResourceLink>>
) => {
  const self = (link as Resource)._self;
  const isExternal = !self;
  let isExpandable = !isExternal; // External resources are never expandable
  if (!isExternal) {
    const response = await getResourceLinks(self);
    isExpandable = !!response._total;
  }
  let label = labelOf(link['@id']);
  label =
    label.length > MAX_LABEL_LENGTH
      ? `${label.slice(0, MAX_LABEL_LENGTH)}...`
      : label;
  return {
    data: {
      label,
      isExternal,
      isExpandable,
      self,
      id: link['@id'],
    },
  };
};

export const createNodesAndEdgesFromResourceLinks = (
  resourceLinks: ResourceLink[],
  originId: string,
  collapsed: boolean
) => {
  return resourceLinks.reduce(
    (pathNodes: cytoscape.ElementDefinition[], link) => {
      const paths = Array.isArray(link.paths) ? link.paths : [link.paths];

      if (collapsed) {
        return [
          ...pathNodes,
          {
            data: {
              label: paths.map(path => labelOf(path)).join(' / '),
              id: `edge-${originId}-${link['@id']}`,
              source: originId,
              target: link['@id'],
            },
          },
        ];
      }

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

export const makeBlankNodes = (
  path: string,
  resourceId: string,
  linkId: string
) => {
  return {
    data: {
      id: `${resourceId}-${path}-${linkId}`,
      isBlankNode: true,
    },
  };
};
