import { IButtonMenu, IDomEditor } from "@wangeditor-next/editor";

export class ButtonMenu implements IButtonMenu {
/**
 * 构造函数，用于创建菜单实例
 * @param title 自定义菜单标题
 * @param tag 菜单标签类型，默认为"button"
 */
  constructor(public title: string, public tag: string = "button") {
    this.title = title; // 自定义菜单标题
    this.tag = "button";
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor: IDomEditor): string | boolean {
    return "";
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor: IDomEditor): boolean {
    return false;
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor: IDomEditor): boolean {
    return false;
  }

  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) return;
    editor.insertText(value); // value 即 this.value(editor) 的返回值
  }
}
