import React, { CSSProperties } from 'react'
import './SubAppCardItem.less';


type Props = {
    containerStyle?: CSSProperties;
    titleStyle?: CSSProperties;
    subtitleStyle?: CSSProperties;
    title: string;
    subtitle: string;
    tileColor: string;
}

export default function SubAppCardItem({
    containerStyle,
    titleStyle,
    subtitleStyle,
    title,
    subtitle,
    tileColor,
}: Props) {
  return (
    <div className='subapp-card-item'>
        <div className='subapp-card-item-container' style={containerStyle}>
            <div className='subapp-card-item-container-title' style={titleStyle}>{title}</div>
            <div className='subapp-card-item-container-subtitle' style={subtitleStyle}>{subtitle}</div>
        </div>
        <div className='subapp-card-item-tile' style={{
            background: tileColor
        }}/>
    </div>
  )
}