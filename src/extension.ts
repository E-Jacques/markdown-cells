// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { generateTable, getGenerateTableData } from "./cells";
import { CellError } from "./errors/CellError";
import { ObjectUtils } from "./utils/object.utils";
import { StringUtils } from "./utils/string.utils";
import { VscodeUtils } from "./utils/vscode.utils";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "markdown-cells" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "markdownCells.generateTable",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      let table: string = "";
      let shouldReplace = false;
      try {
        const data = await getGenerateTableData();
        table = generateTable(data.input);
        shouldReplace = data.shouldReplace;
        console.log("table succefully generated: " + table);
      } catch (error) {
        if (error instanceof CellError) {
          VscodeUtils.showErrorMessage(error.message);
        } else {
          console.error(error);
        }

        return;
      }

      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        VscodeUtils.showErrorMessage("You are not placed in a file.");
        return;
      }

      if (!activeEditor.selection.active) {
        VscodeUtils.showErrorMessage(
          "Please place your cursor somewhere in the file."
        );
        return;
      }

      if (shouldReplace) {
        await activeEditor.edit((editBuilder) => {
          editBuilder.replace(
            new vscode.Range(
              activeEditor.selection.start,
              activeEditor.selection.end
            ),
            ""
          );
        });
      }

      const snipperString = new vscode.SnippetString(table);
      activeEditor.insertSnippet(snipperString, activeEditor.selection.active);
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
