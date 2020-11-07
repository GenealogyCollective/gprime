import { JupyterLabMenu, IMainMenu } from '@jupyterlab/mainmenu';
import {
  ITranslator,
  nullTranslator,
  TranslationBundle
} from '@jupyterlab/translation';
import {
    JupyterFrontEnd
} from '@jupyterlab/application';

import { CommandRegistry } from '@lumino/commands';
import { StackedPanel } from '@lumino/widgets';
import { Menu, MenuBar } from '@lumino/widgets';

import { get } from './handler';
import {Database, Table} from "./database";
import { TABLES } from './constants';
import {DataGridPanel} from "./grid";

/**
 * The class name added to console panels.
 */
const PANEL_CLASS = 'gprime-view';

/**
 * A panel which contains a console and the ability to add other children.
 */
export class gPrimePanel extends StackedPanel {
    private _translator: ITranslator;
    private _trans: TranslationBundle;
    
    constructor(translator: ITranslator) {
	super();
	this._translator = translator;
	this._trans = this._translator.load('jupyterlab');

	this.addClass(PANEL_CLASS);
	this.id = 'gPrimePanel';
	this.title.label = this._trans.__('gPrime');
	this.title.closable = true;
    }

    async populateMenu(commands: CommandRegistry, shell: JupyterFrontEnd.IShell) {
	const results = await get("databases");

	const gprimeMenu = new MenuBar();

	//gprimeMenu.menu.title.label = 'gPrime';
	for (const row of results.data) {
	    // Get the name here:
	    const database_name = new Database(row).name;
	    const tableMenu = new Menu({commands});
	    tableMenu.title.label = `${database_name}`;
	    for (let table of TABLES) {
		const command = `gprime:open-${database_name}-${table.name}`;
		commands.addCommand(command, {
		    label: `${table.proper}`,
		    caption: `Open ${table.name} table`,
		    execute: async () => {
			// Make sure grids don't share database instances:
			const database = new Database(row);
			const results = await get(
			    "table_data",
			    {
				"dirpath": database.dirpath,
				"table": table.name,
			    });
			database.rows = results.rows;
			database.cols = results.cols;
			database.column_labels = results.column_labels;
			database.column_widths = results.column_widths;
			const widget = new DataGridPanel(this._translator, database, table);
			shell.add(widget, 'main');
		    }
		});
		tableMenu.addItem({ command });
	    }
	    //palette.addItem({ command, category: 'Extension Examples' });
	    //gprimeMenu.addGroup([{type: 'submenu' as Menu.ItemType,
	    //			  submenu: tableMenu}])
	    gprimeMenu.addMenu(tableMenu);
	}
      //mainMenu.addMenu(gprimeMenu.menu);
      this.addWidget(gprimeMenu);

    //this._widget = new ButtonWidget();
    //this.addWidget(this._widget);
    //this._widget.stateChanged.connect(this._logMessage, this);
  }

  //private _logMessage(emitter: ButtonWidget, count: ICount): void {
  //  console.log('Hey, a Signal has been received from', emitter);
  //}
}
