import { PaginatedList, Resource, ResourceLink } from '@bbp/nexus-sdk/es';

import { ElementNodeData } from '../../components/Graph';
import { getOrgAndProjectFromResource, labelOf } from '../../utils';

const MAX_LABEL_LENGTH = 20;

export const makeNode = async (
  link: ResourceLink,
  parentId: string | undefined,
  getResourceLinks: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => Promise<PaginatedList<ResourceLink>>
): Promise<{ data: ElementNodeData }> => {
  const self = (link as Resource)._self;
  const isExternal = !self;
  let isExpandable = !isExternal; // External resources are never expandable
  let resourceData;
  if (!isExternal) {
    const { orgLabel, projectLabel } = getOrgAndProjectFromResource(
      link as Resource
    )!;
    const resourceId = link['@id'];
    resourceData = {
      orgLabel,
      projectLabel,
      resourceId,
      self,
    };
    const response = await getResourceLinks(orgLabel, projectLabel, resourceId);
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
      parentId,
      resourceData,
      id: link['@id'],
      externalAddress: isExternal ? link['@id'] : undefined,
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
      const paths = link.paths
        ? Array.isArray(link.paths)
          ? link.paths
          : [link.paths]
        : [];

      if (collapsed) {
        return [
          ...pathNodes,
          {
            data: {
              label: paths.map(path => labelOf(path)).join(' / '),
              id: `edge-${originId}-${link['@id']}`,
              source: originId,
              target: link['@id'],
              parentId: originId,
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
              parentId: originId,
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
              parentId: originId,
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
              parentId: originId,
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
            parentId: originId,
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
      parentId: resourceId,
    },
  };
};

export const getListOfChildrenRecursive = (
  parentId: string,
  elements: cytoscape.ElementDefinition[]
): string[] => {
  const targetNode = elements.find(element => element.data.id === parentId);
  if (!targetNode) {
    return [];
  }
  targetNode.data.isExpanded = false;

  const childIds = elements
    .filter(
      element =>
        element.data.source === parentId || element.data.parentId === parentId
    )
    .map(child => child.data.id)
    .filter(Boolean) as string[];

  const childRecursiveIds = childIds.reduce(
    (childRecursiveIdsList: string[], id: string) => {
      return [
        ...childRecursiveIdsList,
        ...getListOfChildrenRecursive(id, elements),
      ];
    },
    []
  );

  return [...childIds, ...childRecursiveIds];
};
