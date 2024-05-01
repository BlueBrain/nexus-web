import ReactJson from 'react-json-view';

type Props = {
  data: any;
  header?: string;
  showHeader?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
};

const ResponseViewer = ({
  data,
  showHeader = false,
  header = '',
  collapsed = false,
  style = {},
}: Props) => {
  return (
    <ReactJson
      collapsed={collapsed}
      name={showHeader ? header : undefined}
      src={data as object}
      indentWidth={3}
      iconStyle="square"
      enableClipboard={false}
      displayObjectSize={false}
      displayDataTypes={false}
      style={{ maxWidth: 'inherit', width: '600px', ...style }}
    />
  );
};

export default ResponseViewer;
