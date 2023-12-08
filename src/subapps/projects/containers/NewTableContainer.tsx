import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';

import useNotification, { parseNexusError } from '../../../shared/hooks/useNotification';
import NewTableForm from '../components/NewTableForm';
import { FUSION_TABLE_CONTEXT } from '../fusionContext';

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
  const notification = useNotification();

  const saveTable = async (name: string, description: string) => {
    setBusy(true);

    const table = {
      name,
      description,
      '@type': 'FusionTable',
      '@context': FUSION_TABLE_CONTEXT['@id'],
      tableOf: {
        '@id': decodeURIComponent(parentId || ''),
      },
      view: 'graph',
      enableSearch: true,
      enableInteractiveRows: true,
      enableDownload: true,
      enableSave: true,
      resultsPerPage: 5,
      dataQuery: DEFAULT_SPARQL_QUERY,
      configuration: [
        {
          '@type': 'FusionTableColumn',
          name: 'subject',
          format: 'Text',
          enableSearch: true,
          enableSort: true,
          enableFilter: false,
        },
        {
          '@type': 'FusionTableColumn',
          name: 'predicate',
          format: 'Text',
          enableSearch: true,
          enableSort: true,
          enableFilter: false,
        },
        {
          '@type': 'FusionTableColumn',
          name: 'object',
          format: 'Text',
          enableSearch: true,
          enableSort: true,
          enableFilter: false,
        },
      ],
    };

    await nexus.Resource.create(orgLabel, projectLabel, table)
      .then((success) => {
        onSuccess();
        setBusy(false);
      })
      .catch((error) => {
        setBusy(false);
        notification.error({
          message: 'Failed to add a new table',
          description: parseNexusError(error),
        });
      });
  };

  return <NewTableForm onSave={saveTable} onClose={onClickClose} busy={busy} />;
};

export default NewTableContainer;
