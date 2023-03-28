import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import './styles.less';

type Props = {
    containerStyle?: CSSProperties;
    titleStyle?: CSSProperties;
    statsStyle?: CSSProperties;
    title: string;
    label?: string;
    stats?: string;
    to: string;
}

export default function PresetCardItem({
    containerStyle,
    titleStyle,
    statsStyle,
    title,
    stats,
    label,
    to
}: Props) {
    return (
        <Link to={to} className='preset-card'>
            <div className='preset-card-container' style={containerStyle}>
                <div className='preset-card-title' style={titleStyle}>{title}</div>
                <div className='preset-card-stats' style={statsStyle}>{stats} {label}</div>
            </div>
        </Link>
    )
}
export const PresetCardItemSkeleton = () => {
    return (<div className='preset-card skeleton'/>)
}