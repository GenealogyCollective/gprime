import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import {
    ITranslator,
    nullTranslator,
    TranslationBundle
} from '@jupyterlab/translation';
import { DataGrid, DataModel } from '@lumino/datagrid';
import { Menu, StackedPanel } from '@lumino/widgets';

import { requestAPI } from './handler';

/**
 * Initialization data for the extension1 extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
    id: 'datagrid',
    autoStart: true,
    requires: [ICommandPalette, IMainMenu, ITranslator],
    activate: async (
	app: JupyterFrontEnd,
	palette: ICommandPalette,
	mainMenu: IMainMenu,
	translator: ITranslator
    ) => {
	const { commands, shell } = app;
	//const trans = translator.load('jupyterlab');

	// Get some info from the gprime_server:
	let results = null;
	try {
	    results = await requestAPI<any>('get_family_trees');
	    console.log(results);
	} catch (err) {
	    console.error(
		`The gprime_server server extension appears to be missing.\n${err}`
	    );
	}

	const exampleMenu = new Menu({commands});
	exampleMenu.title.label = 'gPrime';
	let count = 0;
	for (const row of results.data) {
	    const command = 'gprime:open' + count;
	    commands.addCommand(command, {
		label: row[0],
		caption: row[0],
		execute: () => {
		    const widget = new DataGridPanel();
		    shell.add(widget, 'main');
		}
	    });
	    exampleMenu.addItem({ command });
	    count++;
	    //palette.addItem({ command, category: 'Extension Examples' });
	}
	mainMenu.addMenu(exampleMenu, { rank: 80 });
    }

};

export default extension;

class DataGridPanel extends StackedPanel {
  constructor(translator?: ITranslator) {
    super();
    this._translator = translator || nullTranslator;
    this._trans = this._translator.load('jupyterlab');

    this.addClass('jp-example-view');
    this.id = 'datagrid-example';
    this.title.label = this._trans.__('Datagrid Example View');
    this.title.closable = true;

    const model = new LargeDataModel();
    const grid = new DataGrid();
    grid.dataModel = model;

    this.addWidget(grid);
  }

  private _translator: ITranslator;
  private _trans: TranslationBundle;
}

class LargeDataModel extends DataModel {
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 1000000000000 : 2;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 1000000000000 : 3;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return `(${row}, ${column})`;
  }
}
