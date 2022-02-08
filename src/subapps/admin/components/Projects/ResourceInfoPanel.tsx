import * as React from 'react';
import { Collapse, Drawer, Popover, Button } from 'antd';
import { labelOf } from '../../../../shared/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import './ResourceInfoPanel.less';

const ResourceInfoPanel: React.FC<{
  typeStats: any;
  relations: any;
  drawerContainer?: HTMLDivElement | null;
  onClickClose: () => void;
}> = ({ typeStats, relations, drawerContainer, onClickClose }) => {
  const { Panel } = Collapse;
  const title = (
    <h2 className="resource-info-panel__title">{typeStats._name}</h2>
  );
  const renderRelation = (relations: any, typeStats: any) => {
    const sourcesRelations = relations.filter((relation: any) => {
      return relation._source === typeStats['@id'];
    });
    const destinationRelations = relations.filter((relation: any) => {
      return relation._target === typeStats['@id'];
    });

    const displayRelations = (relation: any, index: number) => {
      const destination =
        relation._source === typeStats['@id']
          ? relation._target
          : relation._source;
      const source = relation._path[0];
      let arrow = '⟵';
      if (
        relation._source === typeStats['@id'] &&
        relation._target === typeStats['@id']
      ) {
        arrow = '⟷';
      } else if (relation._source === typeStats['@id']) {
        arrow = '⟶';
      }
      return (
        <li key={index}>
          <a href={source['@id']} target="_blank">
            {source._name}
          </a>{' '}
          {arrow}{' '}
          <a href={destination} target="_blank">
            {labelOf(destination)}
          </a>
          {`: ${relation._count}`}
        </li>
      );
    };
    const renderSource = sourcesRelations.map(displayRelations);
    const renderDestination = destinationRelations.map(displayRelations);

    return (
      <div>
        <h2>Outgoing</h2>
        {renderSource}
        <h2>Incoming</h2>
        {renderDestination}
      </div>
    );
  };

  return (
    <Drawer
      destroyOnClose={true}
      onClose={onClickClose}
      visible={true}
      title={title}
      mask={false}
      width={400}
      height={'80%'}
      getContainer={drawerContainer ? drawerContainer : false}
      style={{ marginTop: '52px', overflow: 'auto' }}
    >
      <div className="resource-info-panel">
        <p>
          <a href={typeStats['@id']} target="_blank">
            {typeStats['@id']}
          </a>
        </p>
        <p>{typeStats._count} resources</p>
        <br />
        <Collapse>
          <Panel
            header="Properties (coverage in resources)"
            key="1"
            extra={
              <Popover
                content={() => {
                  return (
                    <div>
                      <p>
                        These are the properties that are used to describe a
                        resource of this type. <br />
                        It also include how many resources use them and overall
                        coverage.
                      </p>
                    </div>
                  );
                }}
                trigger="click"
                placement="bottomRight"
              >
                <Button
                  onClick={event => event.stopPropagation()}
                  size="small"
                  icon={<InfoCircleOutlined />}
                />
              </Popover>
            }
          >
            <ul>
              {typeStats._properties &&
                typeStats._properties.map((property: any) => {
                  return (
                    <li key={property._name}>
                      <span>
                        <a href={property['@id']} target="_blank">
                          {property._name}
                        </a>
                        : {property._count}{' '}
                        {`(${(
                          (property._count / typeStats._count) *
                          100
                        ).toPrecision(4)}%)`}
                      </span>
                      {property._properties && (
                        <ul>
                          {property._properties.map((subProperty: any) => (
                            <li key={subProperty._name}>
                              <a href={subProperty['@id']} target="_blank">
                                {subProperty._name}
                              </a>
                              : {subProperty._count}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
            </ul>
          </Panel>
          <Panel
            header="Relationships"
            key="2"
            extra={
              <Popover
                content={() => {
                  return (
                    <div>
                      <p>
                        These are the known relations between resources of this
                        type and other resources in this project.
                        <br /> It also shows how many times these relations are
                        observed.
                      </p>
                    </div>
                  );
                }}
                trigger="click"
                placement="bottomRight"
              >
                <Button
                  onClick={event => event.stopPropagation()}
                  size="small"
                  icon={<InfoCircleOutlined />}
                />
              </Popover>
            }
          >
            <ul>{relations && renderRelation(relations, typeStats)}</ul>
          </Panel>
        </Collapse>
      </div>
    </Drawer>
  );
};

export default ResourceInfoPanel;
