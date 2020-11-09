export class TableType {
    public name: string;
    public proper: string;

    constructor(name: string, proper: string) {
	this.name = name;
	this.proper = proper;
    }
}

export class Database {
    constructor(object: Database) {
	this.name = object.name;
	this.dirpath = object.dirpath;
	this.path_name = object.path_name;
	this.last = object.last;
	this.tval = object.tval;
	this.enable = object.enable;
	this.stock_id = object.stock_id;
	this.backend_type = object.backend_type;
    }
    public name: string;
    public dirpath: string;
    public path_name: string;
    public last: string;
    public tval: number;
    public enable: Boolean;
    public stock_id: string;
    public backend_type: string;
}

export class Table {
    constructor(database: Database, name: string, proper: string, options: any) {
	this.database = database;
	this.name = name;
	this.proper = proper;
	this.rows = options.rows || 0;
	this.cols = options.cols || 0;
	this.column_labels = options.column_labels || [];
	this.column_widths = options.column_widths || [];
	this.icon = options.icon || null;
    }
    public database: Database;
    public name: string;
    public proper: string;
    public rows: number;
    public cols: number;
    public column_labels: string[];
    public column_widths: number[];
    public icon: string;
}
