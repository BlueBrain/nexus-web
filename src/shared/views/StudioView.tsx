import * as React from 'react';
import { match } from 'react-router';

interface StudioViewProps {
    location: Location;
    match: match<{ orgLabel: string; projectLabel: string; studioId: string }>;
};



const StudioView: React.FunctionComponent<StudioViewProps> = props => {
    const { match } = props;
    const {
        params: { orgLabel, projectLabel, studioId },
      } = match;
    return(
        <h4> Under Construction</h4>
    );
};

export default StudioView;