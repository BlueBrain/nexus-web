import * as React from 'react';
import { Link } from 'react-router-dom';
import { Empty, Button } from 'antd';

const NotFound: React.FunctionComponent = () => {
  return (
    <div className="not-found-view">
      <Empty description={false} />
      <h2>Sorry! The page you are looking for was not found.</h2>
      <Button type="primary">
        <Link to="/">Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
