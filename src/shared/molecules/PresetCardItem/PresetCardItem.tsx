import React, { CSSProperties } from 'react';
import './PresetCardItem.less';

type Props = {
    containerStyle?: CSSProperties;
    titleStyle?: CSSProperties;
    statsStyle?: CSSProperties;
    title: string;
    label?: string;
    stats?: number;
}

export default function PresetCardItem({
    containerStyle,
    titleStyle,
    statsStyle,
    title,
    stats,
    label,
}: Props) {
  return (
    <button className='preset-card'>
        <div className='preset-card-container' style={containerStyle}>
            <div className='preset-card-title' style={titleStyle}>{title}</div>
            <div className='preset-card-stats' style={statsStyle}>{stats} {label}</div>
        </div>
    </button>
  )
}