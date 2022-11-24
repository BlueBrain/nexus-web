import * as React from 'react';
import cytoscape from 'cytoscape';
import './GraphComponent.less';
export declare type ElementNodeData = {
  label: string;
  isExternal: boolean;
  isExpandable: boolean;
  isOrigin?: boolean;
  isBlankNode?: boolean;
  isExpanded?: boolean;
  parentId?: string;
  resourceData?: {
    orgLabel: string;
    projectLabel: string;
    resourceId: string;
    self: string;
  };
  externalAddress?: string;
  id: string;
};
declare const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, data: ElementNodeData): void;
  onNodeClickAndHold?(id: string, data: ElementNodeData): void;
  onNodeHover?(id: string, idata: ElementNodeData): void;
  layout?: string;
  centered?: boolean;
}>;
export default Graph;
