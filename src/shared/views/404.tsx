import { Button,Result } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FunctionComponent = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle={<h3>Sorry! The page you are looking for was not found.</h3>}
      extra={
        <Button type="primary">
          <Link to="/">Home</Link>
        </Button>
      }
    />
  );
};

export default NotFound;
