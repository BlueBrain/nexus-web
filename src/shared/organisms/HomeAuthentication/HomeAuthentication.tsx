import React, { Fragment} from 'react';
import { Popover, Button, Divider } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import './HomeAuthentication.less';

type Props = {}

export default function HomeAuthentication({}: Props) {
    const ConnectPopoverContent = (
        <Fragment>
            <Button>BlueBrain</Button>
            <Divider/>
            <Button>Github</Button>
        </Fragment>
    )
  return (
    <div className='home-authentication'>
        <img src={require('../../images/EPFL_BBP_logo.png')} className='home-authentication-epfl'/>
        <img src={require('../../images/fusion.svg')} className='home-authentication-fusion'/>
        <div className='home-authentication-content'>
            <div className='title'>Nexus.Fusion</div>
            <div className='actions'>
                <Popover trigger={['click']} content={ConnectPopoverContent}>
                    <Button size='large'>
                        Connect
                        <DownOutlined />
                        <UpOutlined />
                    </Button>
                </Popover>
                <Button size='large'>Documentation</Button>
                <Button size='large'>About</Button>
            </div>
        </div>
    </div>
  )
}