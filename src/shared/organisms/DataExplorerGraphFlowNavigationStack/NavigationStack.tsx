import React, { Fragment, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import { RootState } from '../../store/reducers';
import { ResetHighlightedNodeDataExplorerGraphFlow } from '../../store/reducers/data-explorer';
import {
  NavigationStackItem,
  NavigationStackShrinkedItem,
} from '../../molecules/DataExplorerGraphFlowMolecules';
import './styles.less';
import { animate, spring } from 'motion';

const NavigationStack = () => {
  const dispatch = useDispatch();
  const { links, shrinked, highlightIndex } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  const shrinkedRef = useRef(shrinked);
  const stackRef = useRef<HTMLDivElement>(null);

  if (highlightIndex !== -1) {
    setTimeout(() => {
      dispatch(ResetHighlightedNodeDataExplorerGraphFlow());
    }, 2000);
  }
  useEffect(() => {
    if (shrinkedRef.current && !shrinked && stackRef.current) {
      animate(
        stackRef.current,
        { scale: 1 },
        { easing: spring({ stiffness: 10, damping: 10, mass: 500 }) }
      );
    } else if (stackRef.current) {
      animate(
        stackRef.current,
        { display: 'grid' },
        { easing: spring({ stiffness: 300, damping: 10 }) }
      );
    }
  }, [shrinked, shrinkedRef.current]);
  return (
    <div className="navigation-stack__wrapper">
      <div
        ref={stackRef}
        className={clsx('navigation-stack', shrinked && 'shrinked')}
      >
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
      </div>
    </div>
  );
};

export default NavigationStack;
