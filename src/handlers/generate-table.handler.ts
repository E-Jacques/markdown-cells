import * as vscode from "vscode";

import { CellError } from "../errors/CellError";
import { generateTable, getGenerateTableData } from "../services/cells";
import { VscodeUtils } from "../utils/vscode.utils";

export async function handleGenerateTableCommand(): Promise<void> {
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
