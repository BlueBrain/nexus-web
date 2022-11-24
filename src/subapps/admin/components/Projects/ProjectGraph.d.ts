import * as React from 'react';
export declare type ElementNodeData = {
  label: string;
  isOrigin?: boolean;
  id: string;
};
declare const ProjectGraph: React.FC<{
  elements: any;
  viewType: (type?: string, data?: ElementNodeData) => void;
}>;
export default ProjectGraph;
