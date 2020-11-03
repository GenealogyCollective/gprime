import { Menu } from '@lumino/widgets';
import { ICommandPalette } from '@jupyterlab/apputils';
import { JupyterLabMenu, IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator } from '@jupyterlab/translation';
import { get } from './handler';
import { Database, Table } from "./database";
import { DataGridPanel } from "./grid";
const tables = [
    new Table("person", "People"),
    new Table("family", "Families"),
    new Table("event", "Events"),
    new Table("place", "Places"),
    new Table("source", "Sources"),
    new Table("citation", "Citations"),
    new Table("repository", "Repositories"),
    new Table("media", "Media"),
    new Table("note", "Notes")
];
/**
 * Initialization data for the extension1 extension.
 */
const extension = {
    id: 'gprime',
    autoStart: true,
    requires: [ICommandPalette, IMainMenu, ITranslator],
    activate: async (app, palette, mainMenu, translator) => {
        const { commands, shell } = app;
        //const trans = translator.load('jupyterlab');
        const results = await get("databases");
        const gprimeMenu = new JupyterLabMenu({ commands });
        gprimeMenu.menu.title.label = 'gPrime';
        for (const row of results.data) {
            const database = new Database(row);
            const tableMenu = new Menu({ commands });
            tableMenu.title.label = `${database.name}`;
            for (let table of tables) {
                const command = `gprime:open-${database.name}-${table.name}`;
                commands.addCommand(command, {
                    label: `${table.proper}`,
                    caption: `Open ${table.name} table`,
                    execute: async () => {
                        const results = await get("table_data", {
                            "dirpath": database.dirpath,
                            "table": table.name,
                        });
                        database.rows = results.rows;
                        database.cols = results.cols;
                        database.column_labels = results.column_labels;
                        database.column_widths = results.column_widths;
                        const widget = new DataGridPanel(translator, database, table.name);
                        shell.add(widget, 'main');
                    }
                });
                tableMenu.addItem({ command });
            }
            //palette.addItem({ command, category: 'Extension Examples' });
            gprimeMenu.addGroup([{ type: 'submenu', submenu: tableMenu }]);
        }
        mainMenu.addMenu(gprimeMenu.menu);
    }
};
export default extension;
