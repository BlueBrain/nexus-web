import './ToolsEdit.less';
declare type ToolsEditProps = {
  tools: {
    scriptPath: string;
    description: string;
  }[];
  onUpdateTools: (
    tools: {
      scriptPath: string;
      description: string;
    }[]
  ) => void;
};
declare const ToolsEdit: ({
  tools,
  onUpdateTools,
}: ToolsEditProps) => JSX.Element;
export default ToolsEdit;
