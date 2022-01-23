import * as React from 'react';
import { Collapse, Drawer } from 'antd';
import { labelOf } from '../../../../shared/utils';

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
          <Panel header="Properties (coverage in resources)" key="1">
            <ul>
              {typeStats._properties &&
                typeStats._properties.map((property: any) => {
                  return (
                    <li key={property._name}>
                      <span>
                        {property._name}: {property._count}
                      </span>
                      {property._properties && (
                        <ul>
                          {property._properties.map((subProperty: any) => (
                            <li key={subProperty._name}>
                              {subProperty._name}: {subProperty._count}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
            </ul>
          </Panel>
          <Panel header="Relationships" key="2">
            <>
              <ul>
                {relations &&
                  relations.map((relation: any, index: number) => (
                    <li key={index}>
                      {relation._path.map((path: any) => path._name).join('/')}{' '}
                      {'-->'}{' '}
                      {relation._source === typeStats['@id']
                        ? labelOf(relation._target)
                        : labelOf(relation._source)}{' '}
                    </li>
                  ))}
              </ul>
            </>
          </Panel>
        </Collapse>
      </div>
    </Drawer>
  );
};

export default ResourceInfoPanel;
