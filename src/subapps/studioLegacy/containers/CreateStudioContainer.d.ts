import * as React from 'react';
export declare const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
declare const CreateStudioContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  goToStudio?(studioId: string): void;
}>;
export default CreateStudioContainer;
