import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import ResourceViewContainer from '../../containers/ResourceViewContainer';
import ResourceEditorContainer from '../../containers/ResourceEditor';
import { DEFGContentFullscreenHeader } from '../../molecules/DataExplorerGraphFlowMolecules';
import './styles.less';

const DataExplorerContentPage = ({}) => {
  const { current, fullscreen } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  return (
    <div className="degf-content__wrapper">
      {fullscreen ? (
        <Fragment>
          <DEFGContentFullscreenHeader />
          <ResourceEditorContainer
            key={current?._self}
            onSubmit={() => {}}
            onExpanded={() => {}}
            orgLabel={current?.resource?.[0]!}
            projectLabel={current?.resource?.[1]!}
            resourceId={current?.resource?.[2]!}
            rev={current?.resource?.[3]!}
            defaultEditable={false}
            defaultExpanded={false}
            showMetadataToggle={false}
            showFullScreen={false}
            tabChange={false}
            showExpanded={false}
            showControlPanel={false}
          />
        </Fragment>
      ) : (
        <ResourceViewContainer
          key={current?._self}
          deOrgLabel={current?.resource?.[0]}
          deProjectLabel={current?.resource?.[1]}
          deResourceId={current?.resource?.[2]}
        />
      )}
    </div>
  );
};

export default DataExplorerContentPage;
