import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import ResourceViewContainer from '../../containers/ResourceViewContainer';
import ResourceEditorContainer from '../../containers/ResourceEditor';
import { DEFGContentFullscreenHeader } from '../../molecules/DataExplorerGraphFlowMolecules';
import './styles.scss';

const DataExplorerContentPage = ({}) => {
  const { current, fullscreen } = useSelector(
    (state: RootState) => state.dataExplorer
  );
  return (
    <div className="degf-content__wrapper">
      {fullscreen ? (
        <>
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
            tabChange={false}
            showFullScreen={false}
            showMetadataToggle={true}
            showExpanded={true}
            showControlPanel={true}
          />
        </>
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
