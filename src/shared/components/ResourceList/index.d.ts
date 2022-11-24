import * as React from 'react';
import { ResourceList, Resource } from '@bbp/nexus-sdk';
import './ResourceList.less';
export declare type ResourceBoardList = {
  name: string;
  view: string;
  id: string;
  query: {
    from?: number;
    size?: number;
    deprecated?: boolean;
    rev?: number;
    type?: string;
    createdBy?: string;
    updatedBy?: string;
    schema?: string;
    q?: string;
    sort?: string | string[];
  };
};
declare const ResourceListComponent: React.FunctionComponent<{
  busy: boolean;
  list: ResourceBoardList;
  resources: ResourceList<{}>['_results'];
  schemaLinkContainer?: React.FunctionComponent<{
    resource: Resource;
  }>;
  total?: number;
  currentPage: number;
  pageSize?: number;
  hasSearch?: boolean;
  onPaginationChange(
    searchValue: string | undefined,
    page: number,
    pageSize?: number
  ): void;
  onPageSizeChange(pageSize: number): void;
  error: Error | null;
  onDelete(): void;
  onClone(): void;
  onUpdate(list: ResourceBoardList): void;
  onRefresh(): void;
  onSortBy(option: string): void;
  makeResourceUri(resourceId: string): string;
  goToResource(resourceId: string): void;
  shareableLink: string;
}>;
export default ResourceListComponent;
