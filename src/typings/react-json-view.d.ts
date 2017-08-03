/// <reference types="react"/>

declare namespace ReactJsonView {
    interface ReactJsonViewProps {
      src: Object;
      theme?: string;
      name?: string;
      indentWidth?: number;
      displayDataTypes?: boolean;
      collapsed?: boolean;
    }

    interface ReactJsonViewClass extends React.ComponentClass<ReactJsonViewProps> { }
}

declare module "react-json-view" {
    const jsonView: ReactJsonView.ReactJsonViewClass;
    export default jsonView;
}
