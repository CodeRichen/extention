import * as vscode from 'vscode';

let activeDecoration: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeTextEditorSelection(event => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText || selectedText.trim() === '') {
            clearDecorations(editor);
            return;
        }

        const regex = new RegExp(`\\b${escapeRegExp(selectedText)}\\b`, 'g');
        const ranges: vscode.Range[] = [];
        const text = editor.document.getText();

        let match;
        while ((match = regex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            ranges.push(new vscode.Range(startPos, endPos));
        }

        applyDecorations(editor, ranges);
    });
}

function applyDecorations(editor: vscode.TextEditor, ranges: vscode.Range[]) {
    if (activeDecoration) {
        activeDecoration.dispose();
    }

    activeDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 200, 0, 0.5)', // 背景色
        borderRadius: '2px',
    });

    editor.setDecorations(activeDecoration, ranges);
}

function clearDecorations(editor: vscode.TextEditor) {
    if (activeDecoration) {
        activeDecoration.dispose();
        activeDecoration = undefined;
    }
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deactivate() {
    if (activeDecoration) {
        activeDecoration.dispose();
    }
}
