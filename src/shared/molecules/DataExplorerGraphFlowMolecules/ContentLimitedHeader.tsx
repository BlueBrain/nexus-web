import React, { useState } from 'react';
import { Switch } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'shared/store/reducers';
import { InitDataExplorerGraphFlowLimitedVersion } from '../../store/reducers/data-explorer';
import './styles.less';

const DataExplorerGraphFlowContentLimitedHeader = () => {
  const dispatch = useDispatch();
  const { current, limited } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const onSelectWrite = (checked: boolean) => {
    dispatch(InitDataExplorerGraphFlowLimitedVersion(!checked));
  };

  return (
    <div className="degf-content__haeder">
      <div className="title">{current?.title}</div>
      <div className="switcher">
        <span>Read</span>
        <Switch checked={!limited} onChange={onSelectWrite} />
        <span>Write</span>
      </div>
    </div>
  );
};

export default DataExplorerGraphFlowContentLimitedHeader;
