import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { displayError } from '../components/Notifications';
import NewTableForm from '../components/NewTableForm';

const DEFAULT_SPARQL_QUERY =
  'prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/> SELECT DISTINCT ?self ?s WHERE { ?s nxv:self ?self } LIMIT 20';

const NewTableContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  parentId?: string;
  onClickClose: () => void;
  onSuccess: () => void;
}> = ({ orgLabel, projectLabel, parentId, onClickClose, onSuccess }) => {
  const nexus = useNexusContext();
  const [busy, setBusy] = React.useState<boolean>(false);

  const saveTable = async (name: string, description: string) => {
    setBusy(true);

    const table = {
      name,
      description,
      '@type': 'nxv:FusionTable',
      tableOf: {
        '@id': parentId,
      },
      view: 'nxv:defaultSparqlIndex',
      enableSearch: true,
      enableInteractiveRows: true,
      enableDownload: true,
      enableSave: true,
      resultsPerPage: 5,
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
        onSuccess();
        setBusy(false);
      })
      .catch(error => {
        setBusy(false);
        displayError(error, 'Failed to add a new table');
      });
  };

  return <NewTableForm onSave={saveTable} onClose={onClickClose} busy={busy} />;
};

export default NewTableContainer;
