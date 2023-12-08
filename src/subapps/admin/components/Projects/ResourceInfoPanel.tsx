import './ResourceInfoPanel.scss';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Collapse, Drawer, Popover } from 'antd';
import * as React from 'react';

import { labelOf } from '../../../../shared/utils';

const ResourceInfoPanel: React.FC<{
  typeStats: any;
  relations: any;
  panelVisibility: boolean;
  drawerContainer?: HTMLDivElement | null;
  onClickClose: () => void;
}> = ({ typeStats, relations, panelVisibility, drawerContainer, onClickClose }) => {
  const { Panel } = Collapse;
  const title = <h2 className="resource-info-panel__title">{typeStats._name}</h2>;
  const leftArrow = '⟵';
  const rightArrow = '⟶';

  const renderRelation = (relations: any, typeStats: any) => {
    const sourcesRelations = relations.filter((relation: any) => {
      return relation._source === typeStats['@id'];
    });
    const destinationRelations = relations.filter((relation: any) => {
      return relation._target === typeStats['@id'];
    });

    const displayRelations = (relation: any, index: number, arrow: string) => {
      const formattedCount = new Intl.NumberFormat('en-IN', {
        maximumSignificantDigits: 3,
      }).format(relation._count);
      const destination =
        relation._source === typeStats['@id'] ? relation._target : relation._source;
      const source = relation._path[0];

      return (
        <li key={index}>
          <a href={source['@id']} target="_blank" rel="noreferrer">
            {source._name}
          </a>{' '}
          {arrow}{' '}
          <a href={destination} target="_blank" rel="noreferrer">
            {labelOf(destination)}
          </a>
          {`: ${formattedCount}`}
        </li>
      );
    };

    const renderSource = sourcesRelations.map((relation: any, index: number) =>
      displayRelations(relation, index, rightArrow)
    );
    const renderDestination = destinationRelations.map((relation: any, index: number) =>
      displayRelations(relation, index, leftArrow)
    );

    return (
      <>
        <h4>Outgoing</h4>
        <ul>{renderSource}</ul>
        <h4>Incoming</h4>
        <ul>{renderDestination}</ul>
      </>
    );
  };

  return (
    <Drawer
      destroyOnClose={true}
      onClose={onClickClose}
      open={panelVisibility}
      title={title}
      mask={false}
      width={500}
      height={'80%'}
      getContainer={drawerContainer ? drawerContainer : false}
      style={{ marginTop: '52px', overflow: 'auto' }}
    >
      <div className="resource-info-panel">
        <p>
          <a href={typeStats['@id']} target="_blank" rel="noreferrer">
            {typeStats['@id']}
          </a>
        </p>
        <p>{typeStats._count} resources</p>
        <br />
        <Collapse
          items={[
            {
              key: '1',
              label: 'Properties (coverage in resources)',
              children: (
                <ul>
                  {typeStats._properties &&
                    typeStats._properties.map((property: any) => {
                      const formattedProCount = new Intl.NumberFormat('en-IN', {
                        maximumSignificantDigits: 3,
                      }).format(property._count);
                      return (
                        <li key={property._name}>
                          <span>
                            <a href={property['@id']} target="_blank" rel="noreferrer">
                              {property._name}
                            </a>
                            : {formattedProCount}{' '}
                            {`(${((property._count / typeStats._count) * 100).toPrecision(4)}%)`}
                          </span>
                          {property._properties && (
                            <ul>
                              {property._properties.map((subProperty: any) => (
                                <li key={subProperty._name}>
                                  <a href={subProperty['@id']} target="_blank" rel="noreferrer">
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
              ),
              extra: (
                <Popover
                  content={() => {
                    return (
                      <div>
                        <p>
                          These are the properties that are used to describe a resource of this
                          type. <br />
                          It also include how many resources use them and overall coverage.
                        </p>
                      </div>
                    );
                  }}
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button
                    onClick={(event) => event.stopPropagation()}
                    size="small"
                    icon={<InfoCircleOutlined />}
                  />
                </Popover>
              ),
            },
            {
              key: '2',
              label: 'Relationships',
              children: <>{relations && renderRelation(relations, typeStats)}</>,
              extra: (
                <Popover
                  content={() => {
                    return (
                      <div>
                        <p>
                          These are the known relations between resources of this type and other
                          resources in this project.
                          <br /> It also shows how many times these relations are observed.
                        </p>
                      </div>
                    );
                  }}
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button
                    onClick={(event) => event.stopPropagation()}
                    size="small"
                    icon={<InfoCircleOutlined />}
                  />
                </Popover>
              ),
            },
          ]}
        />
      </div>
    </Drawer>
  );
};

export default ResourceInfoPanel;
