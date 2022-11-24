declare type ToolsProps = {
  tools: {
    scriptPath: string;
    description: string;
  }[];
  onAddTool: () => void;
};
declare const Tools: ({ tools, onAddTool }: ToolsProps) => JSX.Element;
export default Tools;
