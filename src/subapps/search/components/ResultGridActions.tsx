import * as React from 'react';
import { Button, Menu, Dropdown, notification } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { match } from 'ts-pattern';
import { triggerCopy } from '../../../shared/utils/copy';

export const DATASET_KEY = 'nexus-dataset';

export type DatasetCollectionSave = {
  ids: string[];
};

export enum EXPORT_ACTIONS {
  AS_ES_QUERY = 'As ES Query',
  AS_DATASET = 'As Nexus Dataset',
  AS_CSV = 'As CSV',
}

const handleExportAsESQuery = (query: object) => () => {
  triggerCopy(JSON.stringify(query, null, 2));
  notification.info({ message: 'Query saved to clipboard' });
};

const handleExportAsDatset = (dataset: DatasetCollectionSave) => () => {
  if (!dataset.ids.length) {
    notification.warning({
      message: 'Please select items to save into a Dataset collection',
    });
    return;
  }
  localStorage.setItem(DATASET_KEY, JSON.stringify(dataset));
  notification.info({ message: 'Saved selected items as dataset for later.' });
};

// const handleExportAsCSV = (query: object) => () => {
//   downloadAsCSV;
// };

const ResultGridActions: React.FC<{
  query: object;
  dataset: DatasetCollectionSave;
}> = ({ query, dataset }) => {
  const handleMenuClick: MenuProps['onClick'] = e => {
    match(e.key)
      .with(EXPORT_ACTIONS.AS_ES_QUERY, () => handleExportAsESQuery(query)())
      .with(EXPORT_ACTIONS.AS_DATASET, () => handleExportAsDatset(dataset)())
      // .with(EXPORT_ACTIONS.AS_CSV, () => handleExportAsCSV(query)())
      .run();
  };

  // This button acts as a default option
  // We can change the default maybe later?
  const handleClick = () => {
    handleExportAsESQuery(query)();
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key={EXPORT_ACTIONS.AS_ES_QUERY}>
        As Elastic Search Query
      </Menu.Item>
      <Menu.Item key={EXPORT_ACTIONS.AS_DATASET}>
        Selected as Nexus Dataset
      </Menu.Item>
      <Menu.Item key={EXPORT_ACTIONS.AS_CSV}>Selected as csv</Menu.Item>
    </Menu>
  );
  return (
    <div>
      <Dropdown.Button onClick={handleClick} overlay={menu}>
        Export
      </Dropdown.Button>
    </div>
  );
};

export default ResultGridActions;
