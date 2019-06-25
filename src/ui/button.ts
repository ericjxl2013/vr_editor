import { Element } from "./element";

export class Button extends Element {


  private _text: string;
  public get text(): string {
    return this._text;
  }
  public set text(val: string) {
    if (this._text === val) return;
    this._text = val;
    this.element!.innerHTML = this._text;
  }


  public constructor(text?: string) {
    super();

    this._text = text ? text : '';

    this.element = document.createElement('div');
    this.element.classList.add('ui-button');
    this.element.innerHTML = this._text;
    this.element.ui = this;
    this.element.tabIndex = 0;

    // space > click
    this.element.addEventListener('keydown', this._onKeyDown, false);
    this.on('click', this._onClick);

  }


  private _onKeyDown(evt: KeyboardEvent): void {
    if (evt.keyCode === 27)
      return (<HTMLElement>evt.target).blur();

    if (evt.keyCode !== 32 || this.disabled)
      return;

    evt.stopPropagation();
    evt.preventDefault();
    this.emit('click');
  }

  private _onClick(): void {
    this.element!.blur();
  };

  // TODO
  public _onLinkChange(value: any): void {
    (<HTMLButtonElement>this.element).value = value;
  };



}