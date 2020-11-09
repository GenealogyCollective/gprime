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
import { TABLE_TYPES, CommandIDs, format } from './constants';
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
	const database = new Database(row);
	const tableMenu = new Menu({commands});
	tableMenu.title.label = database.name;
	for (let table_type of TABLE_TYPES) {
	    const command = format(open_table, {database_name: database.name,
						table_name: table_type.name});
	    commands.addCommand(command, {
		label: table_type.proper, // Person, Family, Repository, ...
		execute: async (args: any) => {
		    const database = new Database(row);
		    const table_data = await get(
			"table_data",
			{
			    "dirpath": database.dirpath,
			    "table": table_type.name,
			});
		    const table = new Table(database, table_type.name,
					    table_type.proper, table_data);
		    const widget = new DataGridPanel(translator, table);

		    widget.title.icon = personIcon;

		    shell.add(widget, 'main');
		}
	    });
	    tableMenu.addItem(
		{command, args: {database_name: database.name,
				 table_name: table_type.name}});
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
