import * as React from 'react';
import { Breadcrumb, Tooltip } from 'antd';
import { Link } from 'react-router-dom';

import './Breadcrumbs.scss';

type BreadcrumbItem = {
  label: string;
  url: string;
};

const Breadcrumbs: React.FC<{ crumbs: BreadcrumbItem[] }> = ({ crumbs }) => {
  return (
    <div className="breadcrumbs">
      <Breadcrumb separator=">">
        {crumbs.map(item => (
          <Breadcrumb.Item key={item.label || ''}>
            <Link to={item.url}>
              {item.label?.length > 35 ? (
                <Tooltip placement="top" title={item.label}>
                  <span className="breadcrumbs__label">
                    {`${item.label.slice(0, 35)}...`}
                  </span>
                </Tooltip>
              ) : (
                <span className="breadcrumbs__label">{item.label}</span>
              )}
            </Link>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
