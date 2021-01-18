import * as React from 'react';
import { Button } from 'antd';
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons';
import { UseSearchProps } from '../../../../shared/hooks/useSearchQuery';
import { TweenOneGroup } from 'rc-tween-one';

import './ActiveFilters.less';

const ActiveFilters: React.FC<{
  searchProps: UseSearchProps;
  onClear: () => void;
  onClearFacet: (key: string, value: string) => void;
  onClearQuery: () => void;
}> = ({ searchProps, onClear, onClearQuery, onClearFacet, children }) => {
  const tagList = [
    <span className="filter-tag" key="clear-filters">
      <Button icon={<CloseCircleFilled />} onClick={onClear}>
        Clear all filters
      </Button>
    </span>,
    ...[
      !!searchProps.query ? (
        <span className="filter-tag" key={`search-${searchProps.query}`}>
          <Button onClick={onClearQuery}>
            <span>
              Search <b>{searchProps.query}</b>{' '}
              <span>
                <CloseOutlined />
              </span>
            </span>
          </Button>
        </span>
      ) : null,
    ],
    ...(searchProps.facetMap
      ? Array.from(searchProps.facetMap).map(
          ([key, { propertyKey, type, label: filterGroupLabel, value }]) => {
            return Array.from(value).map(val => {
              const [label] = val.split('/').reverse();
              const handleClearFacet = () => {
                onClearFacet(key, val);
              };
              return (
                <span className="filter-tag" key={`${propertyKey}-${val}`}>
                  <Button onClick={handleClearFacet}>
                    <span>
                      {filterGroupLabel} <b>{label}</b> <CloseOutlined />
                    </span>
                  </Button>
                </span>
              );
            });
          }
        )
      : []),
  ];

  return (
    <div className="active-filters">
      <TweenOneGroup
        enter={{
          scale: 0.8,
          opacity: 0,
          type: 'from',
          duration: 100,
        }}
        leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
      >
        {tagList}
        {children}
      </TweenOneGroup>
    </div>
  );
};

export default ActiveFilters;
