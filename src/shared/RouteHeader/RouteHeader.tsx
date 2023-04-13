import React, { CSSProperties } from 'react'
import { PlusOutlined } from '@ant-design/icons';
import './styles.less';
import { AccessControl } from '@bbp/react-nexus';

type TProps = {
    title: string; 
    extra: string;
    bg: string;
    alt: string;
    imgCss?: CSSProperties;
    createLabel?: string;
    onCreateClick?(): void;
    permissions?: string[];
}

const RouteHeader = (
    { title, extra, bg, alt, imgCss, createLabel, onCreateClick, permissions = [] }: TProps
) => {
    return (
        <div className='route-header'>
            <img src={bg} alt={alt} style={{ ... imgCss }} />
            <div className='title'>
                <h2>{title}</h2>
                <p>{extra}</p>
            </div>
            <AccessControl permissions={[...permissions]} path="/">
                { createLabel && <div className='action'>
                    <button
                        className='create-btn'
                        onClick={onCreateClick}
                    >
                        {createLabel}
                        <PlusOutlined />
                    </button>
                </div> }
            </AccessControl>
        </div>
    )
}

export default RouteHeader;