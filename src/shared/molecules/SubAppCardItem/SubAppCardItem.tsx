import React, { CSSProperties } from 'react'
import { Link } from 'react-router-dom';
import './styles.less';


type Props = {
    containerStyle?: CSSProperties;
    titleStyle?: CSSProperties;
    subtitleStyle?: CSSProperties;
    title: string;
    subtitle: string;
    tileColor: string;
    to: string;
}

export default function SubAppCardItem({
    containerStyle,
    titleStyle,
    subtitleStyle,
    title,
    subtitle,
    tileColor,
    to
}: Props) {
  return (
    <Link to={to} className='subapp-card-item'>
        <div className='subapp-card-item-container' style={containerStyle}>
            <div className='subapp-card-item-container-title' style={titleStyle}>{title}</div>
            <div className='subapp-card-item-container-subtitle' style={subtitleStyle}>{subtitle}</div>
        </div>
        <div className='subapp-card-item-tile' style={{
            background: tileColor
        }}/>
    </Link>
  )
}