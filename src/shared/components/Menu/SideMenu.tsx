import * as React from 'react';
import { Icon, Card } from 'antd';
import './SideMenu.less';
import { useTransition, animated } from 'react-spring';

const ANIMATIONS = {
  left: {
    from: () => ({ left: -300, opacity: 0 }),
    leave: () => ({ left: -300, opacity: 0 }),
    enter: () => ({ left: 0, opacity: 1 }),
  },
  right: {
    from: () => ({ right: -300, opacity: 0 }),
    leave: () => ({ right: -300, opacity: 0 }),
    enter: () => ({ right: 0, opacity: 1 }),
  },
};

export interface SideMenuProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
}

const SideMenu: React.FunctionComponent<SideMenuProps> = props => {
  const { title, children, visible, onClose, side = 'right' } = props;
  const transitions = useTransition(visible, null, ANIMATIONS[side]);
  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div className="side-menu" style={props} key={key}>
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
                size="small"
                bordered={false}
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
