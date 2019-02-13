import * as React from 'react';
import { Icon, Card } from 'antd';
import './SideMenu.less';
import { useTransition, animated } from 'react-spring';

const DEFAULT_ANIMATIONS = {
  from: () => ({ transform: 'translate3d(300px, 0, 0)', opacity: 0 }),
  leave: () => ({ transform: 'translate3d(300px, 0, 0)', opacity: 0 }),
  enter: () => ({ transform: 'translate3d(0, 0, 0)', opacity: 1 }),
};

export interface SideMenuProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
}

const SideMenu: React.FunctionComponent<SideMenuProps> = props => {
  const { title, children, visible, onClose } = props;
  const transitions = useTransition(visible, null, DEFAULT_ANIMATIONS);
  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div className="side-menu" style={props}>
              <Card
                title={
                  <div className="header">
                    {!!title && <div className="ant-drawer-title">{title}</div>}
                    <button
                      className="ant-drawer-close"
                      aria-label="Close"
                      onClick={onClose}
                    >
                      <Icon type="close" />
                    </button>
                  </div>
                }
              >
                <div className="content">{children}</div>
              </Card>
            </animated.div>
          )
      )}
    </>
  );
};

export default SideMenu;
