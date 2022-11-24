import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { ResourceLinkAugmented } from '../components/ResourceLinks/ResourceLinkItem';
declare type AdminProps = {
  editable: boolean;
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
  resource: Resource;
  latestResource: Resource;
  activeTabKey: string;
  expandedFromQuery: string | string[] | null | undefined;
  refProp: React.MutableRefObject<HTMLDivElement>;
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => void;
  handleTabChange: (activeTabKey: string) => void;
  handleGoToInternalLink: (link: ResourceLinkAugmented) => void;
  handleEditFormSubmit: (value: any) => void;
  handleExpanded: (expanded: boolean) => void;
  refreshResource: () => void;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};
declare const AdminPlugin: React.FunctionComponent<AdminProps>;
export default AdminPlugin;
