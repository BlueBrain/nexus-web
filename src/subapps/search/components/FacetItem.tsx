import * as React from 'react';
import { Checkbox, Badge, Tooltip } from 'antd';
import { TOTAL_HITS_TRACKING } from '../../../shared/hooks/useSearchQuery';

import './FacetItem.less';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

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
  filter?: string;
  onChange?: (key: string, value: boolean) => void;
}> = ({ title, filter = '', facets = [], onChange }) => {
  const [hidden, setHidden] = React.useState(false);

  const handleSelect = (key: string, selected: boolean) => () => {
    onChange && onChange(key, !selected);
  };

  const handleSetHidden = () => {
    setHidden(!hidden);
  };

  const filteredItems = facets.filter(
    ({ key, label }) =>
      key.toLowerCase().includes(filter.toLowerCase()) ||
      label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="facet-group">
      <h4 onClick={handleSetHidden}>
        <span
          className={`chevron ${
            hidden ? 'hidden' : ''
          } ${!filteredItems.length && 'empty'}`}
        >
          <DownOutlined />
        </span>
        {title}{' '}
        <Badge
          count={facets.length}
          overflowCount={OVERFLOW_COUNT}
          style={{ backgroundColor: '#fff', color: '#999' }}
        />
      </h4>
      {!hidden &&
        filteredItems.map(({ label, key, count, selected }) => {
          return (
            <div
              className="item"
              key={key}
              onClick={handleSelect(key, selected)}
            >
              <Checkbox checked={selected} />
              <Tooltip title={key} className="label">
                <span>{label}</span>{' '}
              </Tooltip>
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
