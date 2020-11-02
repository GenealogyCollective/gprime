import { ICommandPalette } from '@jupyterlab/apputils';
import { JupyterLabMenu, IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { DataGrid, DataModel } from '@lumino/datagrid';
import { Menu, StackedPanel } from '@lumino/widgets';
import { get } from './handler';
const tables = ["person", "family", "event", "location"];
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
                const command = `gprime:open-${database.name}-${table}`;
                commands.addCommand(command, {
                    label: `${table}`,
                    caption: `${table}`,
                    execute: async () => {
                        const results = await get("table_schema", {
                            "path_name": database.path_name,
                            "table": table,
                        });
                        database.rows = results.rows;
                        database.cols = results.cols;
                        const widget = new DataGridPanel(translator, database, table);
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
class Database {
    constructor(object) {
        this.name = object.name;
        this.dirpath = object.dirpath;
        this.path_name = object.path_name;
        this.last = object.last;
        this.tval = object.tval;
        this.enable = object.enable;
        this.stock_id = object.stock_id;
        this.backend_type = object.backend_type;
        this.rows = 0;
        this.cols = 0;
    }
}
class DataGridPanel extends StackedPanel {
    constructor(translator, database, table) {
        super();
        this._translator = translator || nullTranslator;
        this._trans = this._translator.load('jupyterlab');
        this.addClass('jp-example-view');
        this.id = 'datagrid-example';
        this.title.label = `${database.name}: ${table}`;
        this.title.closable = true;
        const model = new LargeDataModel(database, table);
        const grid = new DataGrid();
        grid.dataModel = model;
        this.addWidget(grid);
    }
}
class LargeDataModel extends DataModel {
    constructor(database, table) {
        super();
        this._rows = 0;
        this._data = [];
        this._tick = async () => {
            if (this._rows < this._database.rows) {
                const results = await get("table_page", {
                    "table": this._table,
                    "start_pos": this._rows,
                    "page_size": 10
                });
                for (let row of results) {
                    this._data.push(row);
                }
                this.emitChanged({ type: 'rows-inserted', region: 'body',
                    index: this._rows, span: results.length });
                this._rows += results.length;
            }
            else {
                clearInterval(this._timer);
            }
        };
        this._database = database;
        this._table = table;
        console.log("large data model:", this._database, this._table);
        this._timer = setInterval(this._tick, 250);
    }
    rowCount(region) {
        return region === 'body' ? 0 : 1;
    }
    columnCount(region) {
        return region === 'body' ? this._database.cols : 1;
    }
    data(region, row, column) {
        if (region === 'row-header') {
            return `SURNAME, Given name`;
        }
        if (region === 'column-header') {
            return `Column ${column}`;
        }
        if (region === 'corner-header') {
            return "";
        }
        return this._data[row][column];
    }
}
