import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import './styles.scss';

type TProps = {
  containerStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  statsStyle?: CSSProperties;
  title: string;
  label?: string;
  stats?: string;
  to: string;
  selected?: boolean;
  onChangeLayout?(layout?: string): void;
};

const PresetCardItem: React.FC<TProps> = ({
  title,
  stats,
  label,
  to,
  containerStyle,
  titleStyle,
  statsStyle,
}) => {
  return (
    <Link to={to} className="preset-card">
      <div className="preset-card-container" style={containerStyle}>
        <div className="preset-card-title" style={titleStyle}>
          {title}
        </div>
        <div className="preset-card-stats" style={statsStyle}>
          {stats} {label}
        </div>
      </div>
    </Link>
  );
};

export default PresetCardItem;
export const PresetCardItemSkeleton = () => {
  return <div className="preset-card skeleton" />;
};

export const PresetCardItemCompact: React.FC<Partial<TProps>> = ({
  title,
  selected,
  onChangeLayout,
  titleStyle,
}) => {
  return (
    <div
      className={clsx('preset-card compact', selected && 'selected')}
      onClick={() => onChangeLayout?.(title)}
    >
      <div className={'preset-card-title'} style={titleStyle}>
        {title}
      </div>
    </div>
  );
};
