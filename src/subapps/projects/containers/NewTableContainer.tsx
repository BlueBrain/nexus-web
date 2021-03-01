import * as React from 'react';
import { Modal } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ActioButton from '../components/ActionButton';
import NewTableForm from '../components/NewTableForm';

const DEFAULT_SPARQL_QUERY =
  'SELECT ?subject ?predicate ?object WHERE {?subject ?predicate ?object} LIMIT 20';

export type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};

export type TableComponent = Resource<{
  '@type': string;
  name: string;
  description: string;
  parent?: {
    '@id': string;
  };
  view: string;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;

const NewTableContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  parentId?: string;
}> = ({ orgLabel, projectLabel, parentId }) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const onClickAddTable = () => {
    setShowForm(true);
  };

  const saveTable = async (name: string, description: string) => {
    setBusy(true);

    const table = {
      '@type': 'nxv:FusionTable',
      name,
      description,
      parent: {
        '@id': parentId,
      },
      view: 'nxv:defaultSparqlIndex',
      enableSearch: true,
      enableInteractiveRows: true,
      enableDownload: true,
      enableSave: true,
      resultsPerPage: 10,
      dataQuery: DEFAULT_SPARQL_QUERY,
      configuration: [
        {
          '@type': 'nxv:FusionTableColumn',
          name: 'subject',
          format: 'Text',
          enableSearch: true,
          enableSort: true,
          enableFilter: false,
        },
        {
          '@type': 'nxv:FusionTableColumn',
          name: 'predicate',
          format: 'Text',
          enableSearch: true,
          enableSort: true,
          enableFilter: false,
        },
        {
          '@type': 'nxv:FusionTableColumn',
          name: 'object',
          format: 'Text',
          enableSearch: true,
          enableSort: true,
          enableFilter: false,
        },
      ],
    };

    await nexus.Resource.create(orgLabel, projectLabel, table)
      .then(success => {
        setBusy(false);
        // TODO: refresh page to show Table
      })
      .catch(error => {
        setBusy(false);
        // TODO: display error
      });
  };

  return (
    <>
      <ActioButton icon="Add" onClick={onClickAddTable} title="Add table" />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={() => setShowForm(false)}
        width={400}
        destroyOnClose={true}
      >
        <NewTableForm onSave={saveTable} onClose={() => setShowForm(false)} />
      </Modal>
    </>
  );
};

export default NewTableContainer;
