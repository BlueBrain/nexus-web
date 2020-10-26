import * as React from 'react';
import { Checkbox, Badge } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

export type Facet = {
  count: number;
  key: string;
  label: string;
  selected: boolean;
};

const FacetItem: React.FC<{
  title: string;
  facets: Facet[];
  onChange?: (key: string, value: string) => void;
}> = ({ title, facets = [], onChange }) => {
  const handleSelect = (key: string) => (e: CheckboxChangeEvent) => {
    onChange && onChange(key, e.target.value);
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
          <p style={{ marginBottom: '20px' }} key={key}>
            <Checkbox checked={selected} onChange={handleSelect(key)}>
              {label}
            </Checkbox>
            <Badge
              count={count}
              style={{ backgroundColor: '#fff', color: '#999' }}
            />
          </p>
        );
      })}
    </div>
  );
};

export default FacetItem;
