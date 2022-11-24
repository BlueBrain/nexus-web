import './Categories.less';
import { TypeWidgetProps } from '../../types/plugins/report';
declare const TypeWidget: ({
  allTypes,
  availableTypes,
  selectedTypes,
  mode,
  toggleSelectType,
}: TypeWidgetProps) => JSX.Element;
export default TypeWidget;
