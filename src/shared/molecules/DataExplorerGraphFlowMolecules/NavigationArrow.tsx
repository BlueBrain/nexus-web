import './styles.scss';

import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import * as React from 'react';

type NavigationArrowDirection = 'back' | 'forward';

const NavigationArrow = ({
  direction,
  visible,
  title,
  onClick,
}: {
  direction: NavigationArrowDirection;
  visible: boolean;
  title: string;
  onClick: () => void;
}) => {
  return visible ? (
    <button
      className={`navigation-arrow-btn ${direction}`}
      aria-label={`${direction}-arrow`}
      onClick={onClick}
    >
      {direction === 'back' && <ArrowLeftOutlined />}
      <span>{title}</span>
      {direction === 'forward' && <ArrowRightOutlined />}
    </button>
  ) : null;
};

export default NavigationArrow;
