import * as React from 'react';

import { useInputs } from '../hooks/useInputs';
import InputsTable from '../components/InputsTable';

const InputsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
}> = ({ orgLabel, projectLabel, stepId }) => {
  const { inputs } = useInputs(orgLabel, projectLabel, stepId);

  return <InputsTable inputs={inputs} />;
};

export default InputsContainer;
