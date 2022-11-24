import * as React from 'react';
import { StorageData } from '../../containers/StoragesContainer';
import './Storages.less';
declare const Storages: React.FC<{
  storages: StorageData[];
}>;
export default Storages;
