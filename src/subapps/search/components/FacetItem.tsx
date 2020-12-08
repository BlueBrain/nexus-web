import * as React from 'react';
import { Checkbox, Badge } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import './FacetItem.less';

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
  const handleSelect = (key: string) => (e: CheckboxChangeEvent) => {
    onChange && onChange(key, e.target.checked);
  };

  return (
    <div className="facet-group">
      <h4>
        {title}{' '}
        <Badge
          count={facets.length}
          style={{ backgroundColor: '#fff', color: '#999' }}
        />
      </h4>
      {facets.map(({ label, key, count, selected }) => {
        return (
          <div className="item" key={key}>
            <Checkbox checked={selected} onChange={handleSelect(key)} />
            <span className="label">{label}</span>{' '}
            <Badge
              count={count}
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
