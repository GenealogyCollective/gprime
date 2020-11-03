import pickle

class UIState():
    def __init__(self):
        self.window = None

class BaseTable():
    def __init__(self, database):
        self.TABLE = self.__class__.__name__
        self.database = database
        self.config = {}
        for (setting, value) in self.VIEW.CONFIGSETTINGS:
            self.config[setting] = value
        self.column_labels = [column[0] for column in self.VIEW.COLUMNS]
        self.rows = self.database._get_table_func(self.TABLE, "count_func")()
        self.cols = len(self.column_labels)

    def get_table_data(self):
        return {
            "rows": self.rows,
            "cols": self.cols,
            "column_labels": self.column_labels,  # already translated
            "column_widths": self.config["columns.size"],
        }

    def column_order(self):
        order = self.config.get('columns.rank')
        size = self.config.get('columns.size')
        vis = self.config.get('columns.visible')
        colord = [(1 if val in vis else 0, val, size)
            for val, size in zip(order, size)]
        return colord

    def get(self, row_span, col_span):
        self.database.dbapi.execute(
            "SELECT blob_data FROM %s ORDER BY %s "
            "LIMIT %s, %s;" % (
                self.TABLE.lower(),
                self.INDEX,
                row_span[0],
                row_span[1] - row_span[0]))
        results = self.select_cols(self.database.dbapi.fetchall(), col_span)
        return results

    def select_cols(self, rows, col_span):
        model = self.MODEL(self.database, uistate=UIState())
        results = []
        for row in rows:
            data = pickle.loads(row[0])
            row_results = []
            for col in range(self.cols):
                if col_span[0] <= col <= col_span[1]:
                    row_results.append(model.fmap[col](data))
            results.append(row_results)
        return results
