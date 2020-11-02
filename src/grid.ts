import { DataGrid, DataModel } from '@lumino/datagrid';
import { StackedPanel } from '@lumino/widgets';

import {
    ITranslator,
    nullTranslator,
    TranslationBundle
} from '@jupyterlab/translation';

import {Database} from './database';
import { get } from './handler';

export class DataGridPanel extends StackedPanel {
    private _translator: ITranslator;
    private _trans: TranslationBundle;

    constructor(translator: ITranslator, database: Database, table: string) {
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

export class LargeDataModel extends DataModel {
    private _database: Database;
    private _table: string;
    private _rows: number = 0;
    private _data: string[][] = [];
    private _timer: number;

    constructor(database: Database, table: string) {
	super();
	this._database = database;
	this._table = table;
	console.log("large data model:", this._database, this._table);
	this._timer = setInterval(this._tick, 250);
    }

    private _tick = async () => {
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
	} else {
	    clearInterval(this._timer);
	}
    }

    rowCount(region: DataModel.RowRegion): number {

	return region === 'body' ? 0 : 1;
    }

    columnCount(region: DataModel.ColumnRegion): number {
	return region === 'body' ? this._database.cols : 1;
    }

    data(region: DataModel.CellRegion, row: number, column: number): any {
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
