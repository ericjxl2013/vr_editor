interface Events {
  
}

interface Editor {
  method(name: string, fn: Function): void;
  methodRemove(name: string): void;
  call(name: string, ...args: any[]): any;
  on(name: string, fn: Function): EventHandle;
  once(name: string, fn: Function): EventHandle;
  emit(name: string,
    arg0?: any,
    arg1?: any,
    arg2?: any,
    arg3?: any,
    arg4?: any,
    arg5?: any,
    arg6?: any,
    arg7?: any
  ): Events;
  unbind(name: string, fn: Function): Events
}

interface EventHandle {
  name: Nullable<string>;
  owner: Nullable<Events>;
  fn: Nullable<Function>;
  unbind(): void;
  call(): void;
  on(name: string, fn: Function): EventHandle;
}

declare type Nullable<T> = T | null;

declare interface Window {
  editor: Editor;
}

declare var editor: Editor;

declare interface Element1 {
  destroy(): void;
}

declare interface HTMLElement {
  ui: Element1;
}

declare interface TreeItemArgs {
  text: string;
  classList: string[];
  allowDrop: false;
}
