import {
    DataGrid,
    BasicKeyHandler,
    BasicMouseHandler,
    BasicSelectionModel,
    DataModel,
    MutableDataModel,
} from '@lumino/datagrid';
import { StackedPanel } from '@lumino/widgets';
import { Signal } from "@lumino/signaling";

import {
    ITranslator,
    nullTranslator,
    TranslationBundle
} from '@jupyterlab/translation';

import { Database, Table } from './database';
import { get } from './handler';
import { ISlice, parseSlices } from "./slice";

import {
  getKeyboardLayout
} from '@lumino/keyboard';

export class DataGridPanel extends StackedPanel {
    private _translator: ITranslator;
    private _trans: TranslationBundle;

    constructor(translator: ITranslator, database: Database, table: Table) {
	super();
	this._translator = translator || nullTranslator;
	this._trans = this._translator.load('jupyterlab');

	this.addClass('gprime-view');
	this.id = `gprime-datagrid-${table.name}`;
	this.title.label = `${table.proper}: ${database.name}`;
	this.title.caption = `${database.name}: ${table.name}`;
	this.title.closable = true;

	const model = new HugeDataModel(database, table.name);

	let blueStripeStyle: DataGrid.Style = {
	    ...DataGrid.defaultStyle,
	    rowBackgroundColor: i => i % 2 === 0 ? 'rgba(138, 172, 200, 0.3)' : '',
	    columnBackgroundColor: i => i % 2 === 0 ? 'rgba(100, 100, 100, 0.1)' : ''
	};

	const grid = new DataGrid({ style: blueStripeStyle });
	for (let i=0; i < database.column_widths.length; i++) {
	    grid.resizeColumn("body", i, database.column_widths[i]);
	}
	grid.keyHandler = new BasicKeyHandler();
	grid.mouseHandler = new BasicMouseHandler();
	grid.editingEnabled = true;
	grid.dataModel = model;
	grid.selectionModel = new BasicSelectionModel(
	    {
		dataModel: model,
		selectionMode: 'cell'
	    }
	);
	this.addWidget(grid);
    }
}

export class HugeDataModel extends MutableDataModel {
    private _database: Database;
    private _table: string;

    private _slice: string = "";
    private _colSlice: ISlice = { start: null, stop: null };
    private _rowSlice: ISlice = { start: null, stop: null };

    private _blocks: any = Object();
    private _blockSize: number = 50;
    private _colCount: number = 0;
    private _rowCount: number = 0;

    private _refreshed = new Signal<this, void>(this);

    constructor(database: Database, table: string) {
	super();
	this._database = database;
	this._table = table;

	this._rowCount = database.rows;
	this._colCount = database.cols;

	this.emitChanged({
	    type: "rows-inserted",
	    region: "body",
	    index: 0,
	    span: this._rowCount
	});
	this.emitChanged({
	    type: "columns-inserted",
	    region: "body",
	    index: 0,
	    span: this._colCount
	});
    }

    columnCount(region: DataModel.ColumnRegion): number {
	if (region === "body") {
	    if (this.isColSlice()) {
		return this.colSlice.stop - this.colSlice.start;
	    } else {
		return this._colCount;
	    }
	}

	return 1;
    }

    rowCount(region: DataModel.RowRegion): number {
	if (region === "body") {
	    if (this.isRowSlice()) {
		return this.rowSlice.stop - this.rowSlice.start;
	    } else {
		return this._rowCount;
	    }
	}

	return 1;
    }

    data(region: DataModel.CellRegion, row: number, col: number): any {
	// adjust row and col based on slice
	if (this.isRowSlice()) {
	    row += this._rowSlice.start;
	}
	if (this.isColSlice()) {
	    col += this._colSlice.start;
	}

	if (region === "row-header") {
	    return `${row + 1}`
	}
	if (region === "column-header") {
	    return this._database.column_labels[col];
	}
	if (region === "corner-header") {
	    return null;
	}
	const relRow = row % this._blockSize;
	const relCol = col % this._blockSize;
	const rowBlock = (row - relRow) / this._blockSize;
	const colBlock = (col - relCol) / this._blockSize;
	if (this._blocks[rowBlock]) {
	    const block = this._blocks[rowBlock][colBlock];
	    if (block !== "busy") {
		if (block) {
		    // This data has already been loaded.
		    return this._blocks[rowBlock][colBlock][relRow][relCol];
		} else {
		    // This data has not yet been loaded, load it.
		    this._fetchBlock(rowBlock, colBlock);
		}
	    }
	} else {
	    // This data has not yet been loaded, load it.
	    this._blocks[rowBlock] = Object();
	    this._fetchBlock(rowBlock, colBlock);
	}
	return null;
    }

    refresh() {
	const oldRowCount = this.rowCount("body");
	const oldColCount = this.columnCount("body");

	// changing the row/col slices will also change the result
	// of the row/colCount methods
	const slices = parseSlices(this._slice);
	this._rowSlice = slices[0];
	this._colSlice = slices[1];

	this._blocks = Object();

	this.emitChanged({
	    type: "rows-removed",
	    region: "body",
	    index: 0,
	    span: oldRowCount
	});
	this.emitChanged({
	    type: "columns-removed",
	    region: "body",
	    index: 0,
	    span: oldColCount
	});

	this.emitChanged({
	    type: "rows-inserted",
	    region: "body",
	    index: 0,
	    span: this.rowCount("body")
	});
	this.emitChanged({
	    type: "columns-inserted",
	    region: "body",
	    index: 0,
	    span: this.columnCount("body")
	});

	this.emitChanged({
	    type: "model-reset"
	});

	this._refreshed.emit();
    }

    isRowSlice(): boolean {
	return !(isNaN(this._rowSlice.start) && isNaN(this._rowSlice.start));
    }

    isColSlice(): boolean {
	return !(isNaN(this._colSlice.start) && isNaN(this._colSlice.start));
    }

    get rowSlice() {
	return {
	    start: this._rowSlice.start || 0,
	    stop: this._rowSlice.stop || this._rowCount
	};
    }
    get colSlice() {
	return {
	    start: this._colSlice.start || 0,
	    stop: this._colSlice.stop || this._colCount
	};
    }

    get slice(): string {
	return this._slice;
    }
    set slice(s: string) {
	this._slice = s;
	this.refresh();
    }

    get refreshed() {
	return this._refreshed;
    }

    /**
     * fetch a data block. When data is received,
     * the grid will be updated by emitChanged.
     */
    private _fetchBlock = (rowBlock: number, colBlock: number) => {
	this._blocks[rowBlock][colBlock] = "busy";

	const rowStart: number = rowBlock * this._blockSize;
	const rowStop: number = Math.min(
	    rowStart + this._blockSize,
	    this._rowCount
	);
	const colStart: number = colBlock * this._blockSize;
	const colStop: number = Math.min(
	    colStart + this._blockSize,
	    this._colCount
	);

	const params = {
	    table: this._table,
	    dirpath: this._database.dirpath,
	    row: [rowStart, rowStop],
	    col: [colStart, colStop]
	};

	this.dataFetch(params).then(data => {

	    this._blocks[rowBlock][colBlock] = data;
	    this.emitChanged({
		type: "cells-changed",
		region: "body",
		row:
		(rowBlock -
		 (this.isRowSlice() ? this._rowSlice.start / this._blockSize : 0)) *
		    this._blockSize, //rowBlock * this._blockSize,
		column:
		(colBlock -
		 (this.isColSlice() ? this._colSlice.start / this._blockSize : 0)) *
		    this._blockSize, //colBlock * this._blockSize,
		rowSpan:
		this._rowCount <= this._blockSize ? this._rowCount : this._blockSize,
		columnSpan:
		this._colCount <= this._blockSize ? this._colCount : this._blockSize
	    });
	});
    };

    dataFetch(params : any) {
	return get("table_page", params);
    }

    metadata(region: DataModel.CellRegion, row: number, column: number): DataModel.Metadata {
	// return metadata about this region
	switch (region) {
	case 'body':
	    return {"type": "string"};
	default:
	    return {};
	}
    }

    setData(region: DataModel.CellRegion, row: number, col: number, value: any): boolean {
	switch (region) {
	case 'body':
	    console.log("setData", row, col, value);
	    const relRow = row % this._blockSize;
	    const relCol = col % this._blockSize;
	    const rowBlock = (row - relRow) / this._blockSize;
	    const colBlock = (col - relCol) / this._blockSize;
	    this._blocks[rowBlock][colBlock][relRow][relCol] = value; // TODO: get back from database
	    break;
	default:
	    throw 'cannot change header data';
	}

	this.emitChanged({
	    type: 'cells-changed',
	    region: 'body',
	    row: row,
	    column: col,
	    rowSpan: 1,
	    columnSpan: 1
	});

	return true;
    }

}

/* Examples of editing metdata types:
        {
          "name": "index",
          "type": "integer"
        },
        {
          "name": "Name",
          "type": "string",
          "constraint": {
            "minLength": 2,
            "maxLength": 100,
            "pattern": "[a-zA-Z]"
          }
        },
        {
          "name": "Origin",
          "type": "string",
          "constraint": {
            "enum": "dynamic"
          }
        },
        {
          "name": "Revenue",
          "type": "string",
          "constraint": {
            "enum": [
              "$1-5 bn", "$5-20 bn", "$20-100 bn"
            ]
          }
        },
        {
          "name": "Cylinders",
          "type": "array",
          "constraint": {
            "enum": [
              2, 3, 4, 6, 8, 16
            ]
          }
        },
        {
          "name": "Horsepower",
          "type": "number",
          "constraint": {
            "minimum": 50,
            "maximum": 900
          }
        },
        {
          "name": "Models",
          "type": "integer",
          "constraint": {
            "minimum": 1,
            "maximum": 30
          }
        },
        {
          "name": "Automatic",
          "type": "boolean"
        },
        {
          "name": "Date in Service",
          "type": "date"
        },
        {
          "name": "Contact",
          "type": "string",
          "format": "email"
        },
        {
          "name": "Corp. Data",
          "type": "object"
        }
*/
