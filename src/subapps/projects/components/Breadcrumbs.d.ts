import * as React from 'react';
import './Breadcrumbs.less';
declare type BreadcrumbItem = {
  label: string;
  url: string;
};
declare const Breadcrumbs: React.FC<{
  crumbs: BreadcrumbItem[];
}>;
export default Breadcrumbs;
