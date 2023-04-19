import * as React from 'react';
import { animate, spring, glide } from 'motion';
import { useSelector, useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { camelCase } from 'lodash';
import { RootState } from '../../store/reducers';
import { ModalsActionsEnum } from '../../../shared/store/actions/modals';
import './styles.less';

type TCreationButton = {
  title: string;
  action?: string;
};
const CreationButton: React.FC<TCreationButton> = ({ title, action }) => {
  const dispatch = useDispatch();
  const handleOnClick: React.MouseEventHandler<HTMLButtonElement> = () =>
    dispatch({
      type: action,
      payload: true,
    });
  return (
    <button className="creation-button" onClick={handleOnClick}>
      <span>{title}</span>
      <PlusOutlined style={{ fontSize: 18, color: 'white' }} />
    </button>
  );
};
const creationButtons: TCreationButton[] = [
  {
    title: 'Create Organization',
    action: ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL,
  },
  {
    title: 'Create Project',
    action: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
  },
  {
    title: 'Create Studio',
    action: ModalsActionsEnum.OPEN_STUDIO_CREATION_MODEL,
  },
];

const CreationPanel: React.FC<{}> = () => {
  const creationPanelRef = React.useRef<HTMLDivElement>(null);
  const { openCreationPanel } = useSelector(
    (state: RootState) => state.uiSettings
  );
  React.useEffect(() => {
    if (openCreationPanel) {
      creationPanelRef.current &&
        animate(
          creationPanelRef.current,
          { display: 'flex' },
          {
            duration: 0.2,
            easing: 'ease-out',
          }
        );
    } else {
      creationPanelRef.current &&
        animate(
          creationPanelRef.current,
          { display: 'none' },
          {
            duration: 0.3,
            easing: 'ease-in',
          }
        );
    }
  }, [openCreationPanel, creationPanelRef.current]);
  return (
    <div ref={creationPanelRef} className="creation-panel">
      <div className="creation-panel_container">
        {creationButtons.map(t => (
          <CreationButton key={`cb-${camelCase(t.title)}`} {...{ ...t }} />
        ))}
      </div>
    </div>
  );
};

export default CreationPanel;
