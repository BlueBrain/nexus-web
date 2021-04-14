import * as React from 'react';

import './AddComponentButton.less';

const addIcon = require('../../../shared/images/addIcon.svg');

const AddComponentButton: React.FC<{}> = () => {
  const [showMenu, setShowMenu] = React.useState<boolean>(false);

  return (
    <button className="add-component-button" onClick={() => setShowMenu(true)}>
      <img className="add-component-button__icon" src={addIcon} />
    </button>
  );
};

export default AddComponentButton;
