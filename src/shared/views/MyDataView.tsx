import React from 'react';
import { MyData } from '../canvas';

type Props = {};

const MyDataView = (props: Props) => {
  return (
    <div className="my-data-view view-container">
      <MyData />
    </div>
  );
};

export default MyDataView;
