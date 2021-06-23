import * as React from 'react';
import { Drawer } from 'antd';

import { labelOf } from '../../../../shared/utils';

import './ResourceInfoPanel.less';

const ResourceInfoPanel: React.FC<{ typeStats: any; relations: any; onClickClose: () => void }> = ({
  typeStats,
  relations,
  onClickClose,
}) => {
  console.log('relations', relations);

  return (
    <Drawer
    onClose={onClickClose}
      visible={true}
      title={<h2 className="resource-info-panel__title">{typeStats._name}</h2>}
      mask={false}
      width={400}
      style={{ marginTop: '52px' }}
    >
      <div className="resource-info-panel">
        <p>{typeStats['@id']}</p>
        <p>{typeStats._count} resources</p>
        <br />
        <h3>Properties (coverage in resources)</h3>
        <ul>
          {typeStats._properties &&
            typeStats._properties.map((property: any) => {
              return (
                <li>
                  <span>
                    {property._name}: {property._count} resources
                  </span>
                  {property._properties && (
                    <ul>
                      {property._properties.map((subProperty: any) => (
                        <li>
                          {subProperty._name}: {subProperty._count} resources
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
        </ul>
        <br />
        <h3>Relationships</h3>
        <ul>
          {relations &&
            relations.map((relation: any) => (
              <li>
                {relation._path.map((path: any) => path._name).join('/')}{' '}
                {'-->'}{' '}
                {relation._source === typeStats['@id']
                  ? labelOf(relation._target)
                  : labelOf(relation._source)}{' '}
              </li>
            ))}
        </ul>
      </div>
    </Drawer>
  );
};

export default ResourceInfoPanel;
