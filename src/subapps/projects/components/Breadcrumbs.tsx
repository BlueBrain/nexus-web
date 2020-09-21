import * as React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

import './Breadcrumbs.less';

type BreadcrumbItem = {
  label: string;
  url: string;
};

const Breadcrumbs: React.FC<{ crumbs: BreadcrumbItem[] }> = ({ crumbs }) => {
  return (
    <div className="breadcrumbs">
      <Breadcrumb separator=">">
        {crumbs.map(item => (
          <Breadcrumb.Item key={item.label}>
            <Link to={item.url}>
              <span className="breadcrumbs__label">{item.label}</span>
            </Link>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
