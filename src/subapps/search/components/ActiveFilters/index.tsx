import * as React from 'react';
import { Button, Tag } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';

import './ActiveFilters.less';
import { UseSearchProps } from '../../../../shared/hooks/useSearchQuery';
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons';

const ActiveFilters: React.FC<{
  searchProps: UseSearchProps;
  onClear: () => void;
}> = ({ searchProps, onClear }) => {
  // <TweenOneGroup
  //           enter={{
  //             scale: 0.8,
  //             opacity: 0,
  //             type: 'from',
  //             duration: 100,
  //             onComplete: e => {
  //               e.target.style = '';
  //             },
  //           }}
  //           leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
  //           appear={false}
  //         >
  //           {tagChild}
  //         </TweenOneGroup>

  const tagList = [
    searchProps.query && (
      <span
        key={`search-${searchProps.query}`}
        style={{ display: 'inline-block' }}
      >
        <Button className="filter-tag" size="small">
          <span>
            Search <b>{searchProps.query}</b>{' '}
            <span>
              <CloseOutlined />
            </span>
          </span>
        </Button>
      </span>
    ),
    ...(searchProps.facetMap
      ? Array.from(searchProps.facetMap).map(
          ([key, { propertyKey, type, label: filterGroupLabel, value }]) => {
            return Array.from(value).map(val => {
              const [label] = val.split('/').reverse();
              return (
                <span
                  key={`${propertyKey}-${val}`}
                  style={{ display: 'inline-block' }}
                >
                  <Button className="filter-tag" size="small">
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
        <Button
          className="filter-tag"
          icon={<CloseCircleFilled />}
          size="small"
          onClick={onClear}
        >
          Clear all filters
        </Button>
      </TweenOneGroup>
    </div>
  );
};

export default ActiveFilters;
