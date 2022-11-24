/// <reference types="cytoscape" />
import { ResourceLink, PaginatedList } from '@bbp/nexus-sdk';
import { ElementNodeData } from '../../components/Graph';
export declare const makeNode: (
  link: ResourceLink,
  parentId: string | undefined,
  getResourceLinks: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => Promise<PaginatedList<ResourceLink>>
) => Promise<{
  data: ElementNodeData;
}>;
export declare const createNodesAndEdgesFromResourceLinks: (
  resourceLinks: ResourceLink[],
  originId: string,
  collapsed: boolean
) => (
  | import('cytoscape').ElementDefinition
  | {
      data: {
        label: string;
        id: string;
        source: string | undefined;
        target: string | undefined;
        parentId: string;
      };
    }
)[];
export declare const makeBlankNodes: (
  path: string,
  resourceId: string,
  linkId: string
) => {
  data: {
    id: string;
    isBlankNode: boolean;
    parentId: string;
  };
};
export declare const getListOfChildrenRecursive: (
  parentId: string,
  elements: cytoscape.ElementDefinition[]
) => string[];
