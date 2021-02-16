import * as React from 'react';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Button, Drawer, Empty, List } from 'antd';
import useDataCart from '../hooks/useDataCart';
import ResultPreviewItemContainer from '../../subapps/search/containers/ResultPreviewItemContainer';
import DefaultResourcePreviewCard from '!!raw-loader!../../subapps/search/templates/DefaultResourcePreviewCard.hbs';

const DataCartContainer = () => {
  const { length, resources } = useDataCart();

  const [showShoppingCart, setShowShoppingCart] = React.useState(false);

  const handleToggleCart = () => {
    setShowShoppingCart(!showShoppingCart);
  };

  const handleDrawerClose = () => {
    setShowShoppingCart(false);
  };

  return (
    <>
      <Badge size="small" count={length}>
        <Button
          icon={<ShoppingCartOutlined />}
          onClick={handleToggleCart}
        ></Button>
      </Badge>
      <Drawer
        width={400}
        title="Data Cart"
        placement="right"
        onClose={handleDrawerClose}
        visible={showShoppingCart}
      >
        <p>
          You can add resources or collections of resources here to use later.{' '}
        </p>
        <hr />
        <br />
        {!length && (
          <Empty
            description={
              <>
                <p>You don't have any resources in your data cart. </p>
                <p>Try to add one using the Search interface</p>
              </>
            }
          ></Empty>
        )}
        <List
          itemLayout="vertical"
          dataSource={resources}
          renderItem={resource => {
            return (
              <List.Item>
                <div
                  className="result-preview-card"
                  // onClick={handleClickItem(resource)}
                >
                  <ResultPreviewItemContainer
                    resource={resource}
                    defaultPreviewItemTemplate={DefaultResourcePreviewCard}
                  />
                </div>
              </List.Item>
            );
          }}
        />
      </Drawer>
    </>
  );
};

export default DataCartContainer;
