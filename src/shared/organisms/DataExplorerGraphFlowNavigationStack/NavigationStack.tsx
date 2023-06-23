import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import { RootState } from '../../store/reducers';
import { ResetHighlightedNodeDataExplorerGraphFlow } from '../../store/reducers/data-explorer';
// import {
//   NavigationHamburguer,
//   NavigationStackItem,
//   NavigationStackShrinkedItem,
// } from '../../molecules/DataExplorerGraphFlowMolecules';
import './styles.less';

const NavigationStack = () => {
  const dispatch = useDispatch();
  const { links, shrinked, highlightIndex } = useSelector(
    (state: RootState) => state.dataExplorer
  );

  if (highlightIndex !== -1) {
    setTimeout(() => {
      dispatch(ResetHighlightedNodeDataExplorerGraphFlow());
    }, 2000);
  }
  return (
    <div className="navigation-stack__wrapper">
      {/* <div className={clsx('navigation-stack', shrinked && 'shrinked')}>
        {links.map(({ title, types, _self, resource }, index) => {
          if (index === 0) {
            return (
              <Fragment>
                <NavigationStackItem
                  key={_self}
                  highlighted={highlightIndex === index}
                  {...{
                    _self,
                    index,
                    title,
                    types,
                    resource,
                  }}
                />
                <NavigationStackShrinkedItem />
              </Fragment>
            );
          }
          return (
            <NavigationStackItem
              key={_self}
              highlighted={highlightIndex === index}
              {...{
                _self,
                index,
                title,
                types,
                resource,
              }}
            />
          );
        })}
      </div> */}
    </div>
  );
};

export default NavigationStack;
