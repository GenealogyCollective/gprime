export class Table {
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
	this.rows = 0;
	this.cols = 0;
	this.column_labels = [];
	this.column_widths = [];
    }
    public name: string;
    public dirpath: string;
    public path_name: string;
    public last: string;
    public tval: number;
    public enable: Boolean;
    public stock_id: string;
    public backend_type: string;
    public rows: number;
    public cols: number;
    public column_labels: string[];
    public column_widths: number[];
    public icon: string;
}
