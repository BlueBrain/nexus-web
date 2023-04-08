import React, { CSSProperties } from 'react'
import './styles.less';

type TProps = {
    title: string; 
    extra: string;
    bg: string;
    alt: string;
    imgCss?: CSSProperties;
}

const RouteHeader = (
    { title, extra, bg, alt, imgCss }: TProps
) => {
    return (
        <div className='route-header'>
            <img src={bg} alt={alt} style={{ ... imgCss }} />
            <div className='title'>
                <h2>{title}</h2>
                <p>{extra}</p>
            </div>
        </div>
    )
}

export default RouteHeader;