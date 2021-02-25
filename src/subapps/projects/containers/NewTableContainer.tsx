import * as React from 'react';
import { Modal } from 'antd';

import ActioButton from '../components/ActionButton';
import NewTableForm from '../components/NewTableForm';

const NewTableContainer = () => {
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const onClickAddTable = () => {
    setShowForm(true);
  };

  const saveTable = () => {
    console.log('saving');
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
