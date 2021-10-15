import { CloseCircleOutlined, FunnelPlotOutlined } from '@ant-design/icons';
import { Button, Modal, Tag } from 'antd';
import * as React from 'react';
import { labelOf } from '../../../../shared/utils';
import { FilterState, SearchConfigField } from '../../hooks/useGlobalSearch';
import './FiltersConfig.less';

const FiltersConfig: React.FC<{
  onRemoveFilter: (filter: FilterState) => void;
  filters: FilterState[];
  columns: SearchConfigField;
}> = ({ onRemoveFilter, filters, columns }) => {
  const [isFiltersConfigVisible, setIsFiltersConfigVisible] = React.useState(
    false
  );
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const positionModal = () => {
    const buttonRects = buttonRef.current?.getBoundingClientRect();

    return { top: buttonRects?.bottom, left: buttonRects?.left };
  };

  const filterTypeFriendlyNames: { [any: string]: { friendlyName: string } } = {
    allof: { friendlyName: 'is all of' },
    anyof: { friendlyName: 'is any of' },
    noneof: { friendlyName: 'is none of' },
    missing: { friendlyName: 'is missing' },
  };

  const countFilters = () => filters.length;
  const filterTypeFriendlyName = (filterType: string) => {
    console.log(filterType);
    return filterTypeFriendlyNames[filterType].friendlyName;
  };

  const filterTermFriendlyName = (filterTerm: string) =>
    columns?.find(el => el.key === filterTerm.split('.')[0])?.label;

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setIsFiltersConfigVisible(true)}
        type="link"
      >
        <FunnelPlotOutlined />
        {countFilters() > 0 ? (
          <>
            {` ${countFilters()} ${
              countFilters() > 1 ? ' filters' : ' filter'
            }`}
          </>
        ) : (
          <> No filters</>
        )}
      </Button>
      {isFiltersConfigVisible && (
        <Modal
          onCancel={() => setIsFiltersConfigVisible(false)}
          visible={isFiltersConfigVisible}
          style={{ ...positionModal(), position: 'fixed' }}
          mask={false}
          footer={null}
          closable={false}
        >
          {filters.length === 0 && 'No filters applied'}
          {filters.map((el, ix) => (
            <div key={`${ix}-filter`} className="filter">
              <div className="filter__remove">
                <Button type="text" onClick={() => onRemoveFilter(el)}>
                  <CloseCircleOutlined />
                </Button>
              </div>
              <div className="filter__term">
                {filterTermFriendlyName(el.filterTerm)}
              </div>
              <div className="filter__type">
                {filterTypeFriendlyName(el.filterType)}
              </div>
              <div className="filter__values">
                {el.filters.map(fieldFilter => (
                  <Tag key={`${ix}${fieldFilter}`} className="filter__value">
                    {labelOf(fieldFilter)}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </Modal>
      )}
    </>
  );
};

export default FiltersConfig;
