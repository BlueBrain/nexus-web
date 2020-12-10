import * as React from 'react';
import { Checkbox, Badge } from 'antd';
import { TOTAL_HITS_TRACKING } from '../../../shared/hooks/useSearchQuery';

import './FacetItem.less';

const OVERFLOW_COUNT = TOTAL_HITS_TRACKING;

export type Facet = {
  count: number;
  key: string;
  label: string;
  selected: boolean;
};

const FacetItem: React.FC<{
  title: string;
  facets: Facet[];
  onChange?: (key: string, value: boolean) => void;
}> = ({ title, facets = [], onChange }) => {
  const handleSelect = (key: string, selected: boolean) => () => {
    onChange && onChange(key, !selected);
  };

  return (
    <div className="facet-group">
      <h4>
        {title}{' '}
        <Badge
          count={facets.length}
          overflowCount={OVERFLOW_COUNT}
          style={{ backgroundColor: '#fff', color: '#999' }}
        />
      </h4>
      {facets.map(({ label, key, count, selected }) => {
        return (
          <div className="item" key={key} onClick={handleSelect(key, selected)}>
            <Checkbox checked={selected} />
            <span className="label">{label}</span>{' '}
            <Badge
              key={key}
              count={count}
              overflowCount={OVERFLOW_COUNT}
              style={
                selected
                  ? { backgroundColor: '#44c7f4', color: '#fff' }
                  : { backgroundColor: '#b8babb', color: '#fff' }
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default FacetItem;
