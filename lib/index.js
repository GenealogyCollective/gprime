import { ICommandPalette } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { DataGrid, DataModel } from '@lumino/datagrid';
import { Menu, StackedPanel } from '@lumino/widgets';
import { requestAPI } from './handler';
/**
 * Initialization data for the extension1 extension.
 */
const extension = {
    id: 'datagrid',
    autoStart: true,
    requires: [ICommandPalette, IMainMenu, ITranslator],
    activate: async (app, palette, mainMenu, translator) => {
        const { commands, shell } = app;
        //const trans = translator.load('jupyterlab');
        // Get some info from the gprime_server:
        let results = null;
        try {
            results = await requestAPI('get_family_trees');
            console.log(results);
        }
        catch (err) {
            console.error(`The gprime_server server extension appears to be missing.\n${err}`);
        }
        const exampleMenu = new Menu({ commands });
        exampleMenu.title.label = 'gPrime';
        let count = 0;
        for (const row of results.data) {
            const database = new Database(row);
            const command = 'gprime:open' + count;
            commands.addCommand(command, {
                label: database.name,
                caption: database.name,
                execute: async () => {
                    await get_stats(database);
                    const widget = new DataGridPanel(translator, database);
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
async function get_stats(database) {
    // Talk to the gprime_server and get stats about family tree database
    let results = null;
    const dataToSend = { "path_name": database.path_name };
    try {
        results = await requestAPI('get_family_tree_stats', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
        });
        console.log(results);
    }
    catch (err) {
        console.error(`The gprime_server server extension appears to be missing.\n${err}`);
    }
    database.rows = results.rows;
    database.cols = results.cols;
}
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
    constructor(translator, database) {
        super();
        this._translator = translator || nullTranslator;
        this._trans = this._translator.load('jupyterlab');
        this.addClass('jp-example-view');
        this.id = 'datagrid-example';
        this.title.label = this._trans.__(database.name);
        this.title.closable = true;
        const model = new LargeDataModel(database);
        const grid = new DataGrid();
        grid.dataModel = model;
        this.addWidget(grid);
    }
}
class LargeDataModel extends DataModel {
    constructor(database) {
        super();
        this._rows = 0;
        this._data = [];
        this._tick = async () => {
            if (this._rows < this._database.rows) {
                let results = null;
                const dataToSend = {
                    "table": "person",
                    "start_pos": this._rows,
                    "page_size": 10
                };
                try {
                    results = await requestAPI('get_family_tree_page', {
                        body: JSON.stringify(dataToSend),
                        method: 'POST'
                    });
                    console.log(results);
                }
                catch (err) {
                    console.error(`The gprime_server server extension appears to be missing.\n${err}`);
                }
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
        console.log("large data model:", this._database);
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
