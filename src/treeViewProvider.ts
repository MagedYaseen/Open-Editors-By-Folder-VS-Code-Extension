import * as vscode from 'vscode';

export class OpenEditorsTreeViewProvider implements vscode.TreeDataProvider<EditorItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<EditorItem | null | undefined> =
    new vscode.EventEmitter<EditorItem | null | undefined>();
  readonly onDidChangeTreeData: vscode.Event<EditorItem | null | undefined> = this._onDidChangeTreeData.event;

  private groupedEditors: { [folder: string]: string[] } = {};

  refresh(groupedEditors: { [folder: string]: string[] }) {
    console.log("Refreshing with Grouped Editors:", JSON.stringify(groupedEditors, null, 2));
    this.groupedEditors = groupedEditors;
    this._onDidChangeTreeData.fire(undefined);
  }


  getTreeItem(element: EditorItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: EditorItem): Thenable<EditorItem[]> {
    if (!element) {
      return Promise.resolve(
        Object.keys(this.groupedEditors).map(folder =>
          new EditorItem(folder, vscode.TreeItemCollapsibleState.Collapsed, undefined, `folder-${folder}`)
        )
      );
    } else {
      const files = this.groupedEditors[element.label] || [];
      return Promise.resolve(
        files.map(file =>
          new EditorItem(file, vscode.TreeItemCollapsibleState.None, {
            command: 'vscode.open',
            title: "Open File",
            arguments: [vscode.Uri.file(file), { preview: false }] // Ensure a new tab opens
          }, `file-${file}`)
        )
      );
    }
  }
}

class EditorItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly contextValue?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = label;
    this.description = collapsibleState === vscode.TreeItemCollapsibleState.None ? '' : `(${label})`;
  }
}
