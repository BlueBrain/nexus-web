import React, { Fragment } from 'react';
import { clsx } from 'clsx';
import { TNavigationStackSide } from '../../store/reducers/data-explorer';
import {
  NavigationStackItem,
  NavigationStackShrinkedItem,
} from '../../molecules/DataExplorerGraphFlowMolecules';
import useNavigationStackManager from './useNavigationStack';
import './styles.scss';

const NavigationStack = ({ side }: { side: TNavigationStackSide }) => {
  const {
    leftLinks,
    rightLinks,
    leftShrinked,
    rightShrinked,
    onRightExpand,
    onLeftExpand,
  } = useNavigationStackManager();
  const links = side === 'left' ? leftLinks : rightLinks;
  const shrinked = side === 'left' ? leftShrinked : rightShrinked;
  const onExpand = side === 'left' ? onLeftExpand : onRightExpand;
  return (
    <div className={`navigation-stack__wrapper ${side}`}>
      <div className={clsx('navigation-stack', side, shrinked && 'shrinked')}>
        {links.map(({ title, types, _self, resource }, index) => {
          if (index === 0) {
            return (
              <Fragment>
                <NavigationStackItem
                  key={_self}
                  {...{
                    _self,
                    index,
                    title,
                    types,
                    resource,
                    side,
                  }}
                />
                {shrinked && (
                  <NavigationStackShrinkedItem
                    key={`shrinkable-item-${side}`}
                    {...{
                      side,
                      shrinked,
                      links,
                      onExpand,
                    }}
                  />
                )}
              </Fragment>
            );
          }
          return (
            <NavigationStackItem
              key={_self}
              {...{
                _self,
                index,
                title,
                types,
                resource,
                side,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NavigationStack;
