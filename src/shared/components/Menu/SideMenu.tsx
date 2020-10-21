import * as React from 'react';
import { Card } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import { useTransition, animated } from 'react-spring';

import './SideMenu.less';

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
  onClose?: () => void;
  side?: 'left' | 'right';
  tabList?: any;
  activeTabKey?: any;
  tabBarExtraContent?: any;
  onTabChange?: (key: string) => void;
}

const SideMenu: React.FunctionComponent<SideMenuProps> = props => {
  const {
    title,
    children,
    visible,
    onClose,
    side = 'right',
    tabList,
    activeTabKey,
    tabBarExtraContent,
    onTabChange,
  } = props;
  const transitions = useTransition(visible, null, ANIMATIONS[side]);
  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div className="side-menu" style={props} key={key}>
              <Card
                title={
                  (title || onClose) && (
                    <div className="header">
                      {!!title && (
                        <div className="ant-drawer-title">{title}</div>
                      )}
                      {!!onClose && (
                        <button
                          className="ant-drawer-close"
                          aria-label="Close"
                          onClick={onClose}
                        >
                          <Icon type="close" />
                        </button>
                      )}
                    </div>
                  )
                }
                tabList={tabList}
                activeTabKey={activeTabKey}
                tabBarExtraContent={tabBarExtraContent}
                onTabChange={onTabChange}
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
