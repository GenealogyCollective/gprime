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
    constructor(translator) {
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
}
class LargeDataModel extends DataModel {
    rowCount(region) {
        return region === 'body' ? 1000000000000 : 2;
    }
    columnCount(region) {
        return region === 'body' ? 1000000000000 : 3;
    }
    data(region, row, column) {
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
