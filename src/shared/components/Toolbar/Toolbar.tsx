import * as React from 'react';
import RenameableItem from '../Renameable';

import './Toolbar.less';

interface ToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => any;
}
const Toolbar: React.FunctionComponent<ToolbarProps> = props => {
  return (
    <div className="Toolbar">
      <RenameableItem
        defaultValue={props.projectName}
        onChange={props.onProjectNameChange}
      />
      <span className="divider" />
      <p>Permission Type</p>
      <span className="divider" />
      <p>Dropdown</p>
      <span className="divider" />
      <p>list of people</p>
      <span className="divider" />
      <p>add someone</p>
    </div>
  );
};

export default Toolbar;
