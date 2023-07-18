import * as React from 'react';
import { NavigationArrow } from '../../molecules/DataExplorerGraphFlowMolecules';
import useNavigationStackManager from './useNavigationStack';
import './styles.less';

const NavigationArrows = () => {
  const {
    onNavigateBack,
    onNavigateForward,
    backArrowVisible,
    forwardArrowVisible,
  } = useNavigationStackManager();

  return (
    <div className="navigation-arrows">
      <NavigationArrow
        key="navigation-arrow-back"
        direction="back"
        title="Back"
        visible={backArrowVisible}
        onClick={onNavigateBack}
      />
      <NavigationArrow
        key="navigation-arrow-forward"
        title="Forward"
        direction="forward"
        visible={forwardArrowVisible}
        onClick={onNavigateForward}
      />
    </div>
  );
};

export default NavigationArrows;
