import './CategoryTypeEdits.less';
import { CategoryEditWidgetProps } from '../../types/plugins/report';
declare const CategoryEditWidget: ({
  allCategories,
  dispatch,
  currentlyBeingEditedAnalysisReportCategories,
}: CategoryEditWidgetProps) => JSX.Element;
export default CategoryEditWidget;
