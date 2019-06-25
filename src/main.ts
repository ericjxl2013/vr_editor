import { Editor, Layout, Viewport, Hierarchy } from './editor';

import { Element, Canvas } from './ui';
import { VeryEngine } from './engine';

export * from './index';

// 添加到全局变量
window.editor = new Editor();

// 整体布局
let layout = new Layout();
layout.init();

// 编辑视窗
let viewport = new Viewport();
VeryEngine.viewport = viewport;

// 层级菜单
let hierarchy = new Hierarchy();

/* TEST
editor.once('load', () => {
  console.log('once');
});

editor.on('array', () => {
  console.log('1');
});
editor.on('array', () => {
  console.log('2');
});
editor.on('array', () => {
  console.log('3');
});

editor.on('array', (args0: any, args1: any) => {
  console.log(args0 + ' +++ ' +  args1);
});

editor.method('method', (a: any) => {
  console.log(a);
});


editor.emit('load');
editor.emit('load');

editor.emit('array', 'abc', 'dfg');
editor.emit('array');

editor.call('method', 123);
*/

// let parent: HTMLElement = document.getElementById('test')!;

// console.log('children');

// console.log(parent);
// console.log(parent.childNodes);

// for(let i: number = 0; i < parent.children.length; i++) {
//   (<HTMLElement>(parent.children[i])).ui = new Element();
//   console.warn((<HTMLElement>(parent.children[i])).ui === undefined);
//   console.log((<HTMLElement>(parent.children[i])).ui);
//   (<HTMLElement>(parent.children[i])).ui.destroy();
//   console.log(parent.children[i] instanceof HTMLElement);
// }

// console.log('childNodes');

// for(let i: number = 0; i < parent.childNodes.length; i++) {
//   console.log(parent.childNodes[i] instanceof HTMLElement);
// }
