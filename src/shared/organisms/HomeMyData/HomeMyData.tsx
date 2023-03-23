import React from 'react';
import { MyDataHeader, MyDataTable } from '../../molecules';
import './HomeMyData.less';



type Props = {}

const HomeMyData = (props: Props) => {
  return (
    <div className='home-mydata'>
        <MyDataHeader/>
        <MyDataTable/>
    </div>
  )
}

export default HomeMyData