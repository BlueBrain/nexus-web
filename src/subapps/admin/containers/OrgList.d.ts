import * as React from 'react';
import { OrgResponseCommon } from '@bbp/nexus-sdk';
declare const OrgListContainer: React.FunctionComponent<{
  children: any;
  defaultSearchValue?: string;
  height?: number;
  orgs: {
    total: number;
    items: OrgResponseCommon[];
    searchValue?: string;
    includeDeprecated?: boolean;
  };
  loadMore: ({ searchValue }: { searchValue: string }) => void;
}>;
export default OrgListContainer;
