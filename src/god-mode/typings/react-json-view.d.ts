/// <reference types="react"/>

declare namespace ReactJsonView {

  export interface OnChangeProps<S= any> {
    updated_src: S; // new src value
  }

  export interface OnEditProps<T= any, S= any> extends OnChangeProps<S> {
    name: string; // new var name
    namespace: string[]; // list, namespace indicating var location
    existing_src: S; // new src value
    existing_value: T; // existing variable value
    new_value: T; // new variable value
  }

  interface ReactJsonViewProps {
    src: Object;
    theme?: string;
    name?: string;
    indentWidth?: number;
    displayDataTypes?: boolean;
    collapsed?: boolean;
    onEdit?: (props: OnEditProps) => boolean;
    onAdd?: (props: OnChangeProps) => boolean;
    onDelete?: (props: OnChangeProps) => boolean;
  }

  interface ReactJsonViewClass extends React.ComponentClass<ReactJsonViewProps> {
  }
}

declare module "react-json-view" {
  const jsonView: ReactJsonView.ReactJsonViewClass;
  export default jsonView;
}
