import * as vscode from "vscode";

export class VscodeUtils {
  static showErrorMessage(message: string): void {
    if (!message.startsWith("[Markdown Cells]")) {
      message = `[Markdown Cells] ${message}`;
    }

    vscode.window.showErrorMessage(message);
  }
}
