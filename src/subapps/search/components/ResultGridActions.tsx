import * as React from 'react';
import { Button, Menu, Dropdown, notification } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { match } from 'ts-pattern';
import { Parser } from 'json2csv';

import { download } from '../../../shared/utils/download';
import { triggerCopy } from '../../../shared/utils/copy';

export const DATASET_KEY = 'nexus-dataset';
export const EXPORT_CSV_FILENAME = 'nexus-query-result.csv';
export const CSV_MEDIATYPE = 'text/csv';

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
  localStorage.setItem(DATASET_KEY, JSON.stringify(dataset));
  notification.info({ message: 'Saved selected items as dataset for later.' });
};

const handleExportAsCSV = (object: object, fields: string[]) => () => {
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(object);
  download(EXPORT_CSV_FILENAME, CSV_MEDIATYPE, csv);
};

const ResultGridActions: React.FC<{
  query: object;
  dataset: DatasetCollectionSave;
  csv: {
    data: object;
    fields: string[];
  };
}> = ({ query, dataset, csv }) => {
  const handleMenuClick: MenuProps['onClick'] = e => {
    match(e.key)
      .with(EXPORT_ACTIONS.AS_ES_QUERY, () => handleExportAsESQuery(query)())
      .with(EXPORT_ACTIONS.AS_DATASET, () => handleExportAsDatset(dataset)())
      .with(EXPORT_ACTIONS.AS_CSV, () =>
        handleExportAsCSV(csv.data, csv.fields)()
      )
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
      {dataset.ids.length && (
        <Menu.Item key={EXPORT_ACTIONS.AS_DATASET}>
          Selected as Nexus Dataset
        </Menu.Item>
      )}
      <Menu.Item key={EXPORT_ACTIONS.AS_CSV}>As CSV</Menu.Item>
    </Menu>
  );
  return (
    <Dropdown.Button onClick={handleClick} overlay={menu}>
      Export
    </Dropdown.Button>
  );
};

export default ResultGridActions;
