import * as vscode from 'vscode';
import { OpenEditorsTreeViewProvider } from './treeViewProvider';

let treeViewProvider: OpenEditorsTreeViewProvider;
let lastGroupedEditors: { [folder: string]: string[] } = {};

export function activate(context: vscode.ExtensionContext) {
	console.log('✅ Open Editors By Folder extension is now active.');

	treeViewProvider = new OpenEditorsTreeViewProvider();
	vscode.window.registerTreeDataProvider('openEditorsByFolder', treeViewProvider);

	context.subscriptions.push(
		vscode.window.onDidChangeVisibleTextEditors(updateEditorGroups),
		vscode.workspace.onDidOpenTextDocument(updateEditorGroups),
		vscode.workspace.onDidCloseTextDocument(updateEditorGroups)
	);

	updateEditorGroups();
}

function updateEditorGroups() {
	const editors = vscode.window.visibleTextEditors;
	const newGroupedEditors: { [folder: string]: string[] } = {};

	editors.forEach(editor => {
		if (!editor || editor.document.uri.scheme !== 'file') return;

		const filePath = editor.document.uri.fsPath;
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		const folderKey = workspaceFolder ? workspaceFolder.name : 'Unknown Folder';

		if (!newGroupedEditors[folderKey]) {
			newGroupedEditors[folderKey] = [];
		}
		if (!newGroupedEditors[folderKey].includes(filePath)) {
			newGroupedEditors[folderKey].push(filePath);
		}
	});

	console.log("New Grouped Editors Before Comparison:", JSON.stringify(newGroupedEditors, null, 2));

	if (JSON.stringify(newGroupedEditors) === JSON.stringify(lastGroupedEditors)) {
		return;
	}

	lastGroupedEditors = newGroupedEditors;

	console.log("✅ Fixed Grouped Open Editors:", JSON.stringify(newGroupedEditors, null, 2));

	vscode.commands.executeCommand('setContext', 'openEditorsByFolder.hasEditors', Object.keys(newGroupedEditors).length > 0);

	treeViewProvider.refresh(newGroupedEditors);
}





export function deactivate() {
	console.log('⚠️ Open Editors By Folder extension is now deactivated.');
}
