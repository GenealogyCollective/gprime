import {
    JupyterFrontEnd,
} from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import {
    ITranslator,
} from '@jupyterlab/translation';
import { CommandRegistry } from '@lumino/commands';
import { Menu } from '@lumino/widgets';

import {Database, Table} from "./database";
import { get } from './handler';
import { TABLES, CommandIDs, format } from './constants';
import {DataGridPanel} from "./grid";

import { LabIcon } from '@jupyterlab/ui-components';
import gramps_person_svg from './gramps-person.svg';

const personIcon = new LabIcon({
    name: 'gprime:gramps-person',
    svgstr: gramps_person_svg
});				

export async function populateMenu(commands: CommandRegistry,
		   shell: JupyterFrontEnd.IShell,
		   mainMenu: IMainMenu,
		   translator: ITranslator) {
    const results = await get("databases");
    
    const open_table = CommandIDs.open_table;
    
    const gPrimeMenu = new Menu({commands});
    gPrimeMenu.title.label = 'gPrime';
    
    const dbMenu = new Menu({commands});
    dbMenu.title.label = 'Family Trees';
    
    gPrimeMenu.addItem({type: "submenu", submenu: dbMenu});
    
    for (const row of results.data) {
	// Get the name here:
	const database_name = new Database(row).name;
	const tableMenu = new Menu({commands});
	tableMenu.title.label = database_name;
	for (let table of TABLES) {
	    const command = format(open_table, {database_name, table_name: table.name});
	    commands.addCommand(command, {
		label: table.proper, // Person, Family, Repository, ...
		execute: async (args: any) => {
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
		    database.icon = results.icon;
		    const widget = new DataGridPanel(translator, database, table);

		    widget.title.icon = personIcon;

		    shell.add(widget, 'main');
		}
	    });
	    tableMenu.addItem({command, args: {database_name, table_name: table.name}});
	}
	//palette.addItem({ command, category: 'Extension Examples' });
	dbMenu.addItem({ type: 'submenu', submenu: tableMenu });
    }
    const gPrimeGroup = [
	{type: "submenu", submenu: gPrimeMenu} as Menu.IItemOptions,
	{type: "separator"} as Menu.IItemOptions
];
    mainMenu.fileMenu.addGroup(gPrimeGroup, 0);
}
