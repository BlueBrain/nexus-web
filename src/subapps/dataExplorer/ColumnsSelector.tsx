import React, { useEffect, useReducer, useState } from 'react';
import { Input, Select, Col } from 'antd';
import { RowRenderer } from '../../shared/molecules/MyDataHeader/MyDataHeaderFilters/TypeSelector';
import Light from '../../shared/components/Icons/Light';

export type TColumn = { value: string; selected: boolean; key: string };
type TColumnsSelectorProps = {
  columns: TColumn[];
  loading: boolean;
  onColumnSelect: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    value: TColumn
  ) => void;
};
type TColumnsSelectorState = {
  inputColumns: TColumn[];
  queryTerm: string;
};

const ColumnItem = ({ value }: TColumn) => {
  return (
    <Col span={20}>
      <span title={value}>{value}</span>
    </Col>
  );
};

const ColumnsSelector = ({
  columns,
  loading,
  onColumnSelect,
}: TColumnsSelectorProps) => {
  const [{ inputColumns, queryTerm }, updateSearchResults] = useReducer(
    (
      previous: TColumnsSelectorState,
      next: Partial<TColumnsSelectorState>
    ) => ({
      ...previous,
      ...next,
    }),
    {
      inputColumns: columns,
      queryTerm: '',
    }
  );
  const onSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.type === 'click' || e.target.value === '') {
      updateSearchResults({ inputColumns: columns, queryTerm: '' });
    }
    updateSearchResults({
      queryTerm: e.target.value,
      inputColumns: columns.filter(column =>
        column.value.toLowerCase().includes(e.target.value.toLowerCase())
      ),
    });
  };
  useEffect(() => {
    updateSearchResults({ inputColumns: columns });
  }, [columns]);

  return (
    <div className="columns-selector">
      <div className="columns-selector-wrapper">
        <label htmlFor="columns-selector">Columns: </label>
        <Select
          id="columns-selector"
          style={{ width: 300 }}
          placeholder="custom dropdown render"
          className="columns-selector-dropdown"
          popupClassName="columns-selector-popup"
          virtual={false}
          dropdownStyle={{ position: 'fixed' }}
          value={
            loading
              ? 'Loading...'
              : `${columns.filter(item => item.selected).length} active columns`
          }
          loading={loading}
          disabled={loading}
          dropdownRender={() => (
            <>
              <div className="columns-search-container">
                <Input.Search
                  allowClear
                  placeholder="Search column"
                  className="columns-selector-search"
                  value={queryTerm}
                  onChange={onSearchValueChange}
                />
              </div>
              <div className="columns-selector-container">
                {inputColumns.map(column => (
                  <RowRenderer<TColumn>
                    key={column.key}
                    value={column}
                    checked={Boolean(
                      columns?.find(item => item.value === column.value)
                        ?.selected
                    )}
                    onCheck={onColumnSelect}
                    titleComponent={ColumnItem}
                  />
                ))}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default ColumnsSelector;
