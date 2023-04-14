import * as React from 'react';
import { animate, spring, glide } from 'motion';
import { useSelector, useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { RootState } from '../../store/reducers';
import './styles.less';

type TCreationButton = {
  title: string;
};
const CreationButton: React.FC<TCreationButton> = ({ title }) => {
  return (
    <button className="creation-button">
      <span>{title}</span>
      <PlusOutlined style={{ fontSize: 18, color: 'white' }} />
    </button>
  );
};
const creationButtons: TCreationButton[] = [
  {
    title: 'Create Organization',
  },
  {
    title: 'Create Project',
  },
  {
    title: 'Create Studio',
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
          <CreationButton {...{ ...t }} />
        ))}
      </div>
    </div>
  );
};

export default CreationPanel;
