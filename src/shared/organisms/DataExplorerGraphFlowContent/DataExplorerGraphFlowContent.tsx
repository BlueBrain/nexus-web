import './styles.scss';

import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import ResourceEditorContainer from '../../containers/ResourceEditor';
import ResourceViewContainer from '../../containers/ResourceViewContainer';
import { DEFGContentFullscreenHeader } from '../../molecules/DataExplorerGraphFlowMolecules';
import { RootState } from '../../store/reducers';

const DataExplorerContentPage = ({}) => {
  const { current, fullscreen } = useSelector((state: RootState) => state.dataExplorer);
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
            tabChange={false}
            showFullScreen={false}
            showMetadataToggle={true}
            showExpanded={true}
            showControlPanel={true}
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
