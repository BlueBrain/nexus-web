import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { ReactNode, useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
  onHidden: () => void;
}

export const CollapsibleOnScroll: React.FC<Props> = ({
  children,
  onHidden,
}: Props) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [hardVisible, setHardVisible] = useState<boolean>(false);

  const handleScrollChange = () => {
    setIsHidden(window.scrollY !== 0);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScrollChange);
    return () => {
      window.removeEventListener('scroll', handleScrollChange);
    };
  }, []); // only add event listener on mount & clean on unmount

  return (
    <>
      {isHidden && (
        <Button
          style={{ position: 'sticky', top: 100, zIndex: 10, color: '#003A8C' }}
          shape="circle"
          icon={<SettingOutlined />}
          onClick={() => {
            setHardVisible(!hardVisible);
            onHidden();
          }}
        ></Button>
      )}
      <div
        style={{
          position: hardVisible ? 'fixed' : 'relative',
          top: hardVisible ? 60 : 0,
          left: 0,
          width: '100vw',
          height: hardVisible || !isHidden ? 200 : 0,
          background: 'white',
          zIndex: hardVisible ? 60 : 0,
        }}
      >
        {children}
      </div>
    </>
  );
};
