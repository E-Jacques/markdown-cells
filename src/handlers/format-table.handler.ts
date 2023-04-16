import * as vscode from "vscode";
import { CellError } from "../errors/CellError";

import { getFullTable, parseData, generateTable } from "../services/cells";
import { VscodeUtils } from "../utils/vscode.utils";

export async function handleFormatTableCommand(): Promise<void> {
  let table: string;
  try {
    const tableData = getFullTable();
    console.log(tableData);
    const data = parseData(tableData.split("\n"), "|");
    const headers = data.headers?.map((v) => v.toString().trim());
    const content = data.content?.map((arr) =>
      arr.map((v) => v.toString().trim())
    );

    table = generateTable({ ...data, headers, content });
  } catch (error) {
    if (error instanceof CellError) {
      VscodeUtils.showErrorMessage(error.message);
    } else {
      VscodeUtils.showErrorMessage("Internal error occured.");
      console.error(error);
    }
    return;
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return VscodeUtils.showErrorMessage("Please select a file.");
  }

  activeEditor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(
        activeEditor.selection.start,
        activeEditor.selection.end
      ),
      table
    );
  });
}
