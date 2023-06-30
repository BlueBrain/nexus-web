import React, { useState } from 'react';
import { Switch } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';
import './styles.less';

const DataExplorerGraphFlowContentLimitedHeader = () => {
  const { current } = useSelector((state: RootState) => state.dataExplorer);
  const [write, setWrite] = useState(false);
  const onSelectWrite = (checked: boolean) => setWrite(() => checked);

  return (
    <div className="degf-content__haeder">
      <div className="title">{current?.title}</div>
      <div className="switcher">
        <span>Read</span>
        <Switch checked={write} onChange={onSelectWrite} />
        <span>Write</span>
      </div>
    </div>
  );
};

export default DataExplorerGraphFlowContentLimitedHeader;
