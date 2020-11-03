import pickle
import json
import re
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

if 'GRAMPS_RESOURCES' not in os.environ:
    print("WARNING: GRAMPS_RESOURCES is not defined")

from gramps.cli.clidbman import CLIDbManager
from gramps.gen.dbstate import DbState
from gramps.gen.db.utils import make_database, get_dbid_from_path
from gramps.gen.lib import Person
from gramps.gen.simple import SimpleAccess
from gramps.gen.datehandler import format_time

DBSTATE = DbState()
DBMAN = CLIDbManager(DBSTATE)
GENDERS = ["Female", "Male", "Unknown"]

class gPerson():
    def __init__(self, database):
        self.database = database

    def get_rows(self):
        return self.database.get_number_of_people()

    def get_cols(self):
        return 15 # number of columns

    def get_column_labels(self):
        return ["ID", "Name", "Gender",
                "Birth Date", "Birth Place",
                "Death Date", "Death Place", "Spouse",
                "Number of Parents", "Number of Marriages",
                "Number of Children", "Number of Notes",
                "Private", "Tags", "Last Changed"]

    def get_column_widths(self):
        return [50, 200, 100, 150, 200,
                150, 200, 200, 50, 50, 50, 50, 50,
                100, 150]

    def get(self, row_span, col_span):
        self.database.dbapi.execute(
            "SELECT blob_data FROM person ORDER BY surname "
            "LIMIT %s, %s;" % (row_span[0],
                               row_span[1] - row_span[0]))
        results = self.select_cols(self.database.dbapi.fetchall(), col_span)
        return results

    def select_cols(self, raw_data, col_span):
        sa = SimpleAccess(self.database)
        results = []
        for row in raw_data:
            data = pickle.loads(row[0])
            obj = Person(data) # gramps person
            result_row = []
            result_row.append(obj.gramps_id)
            result_row.append(sa.name(obj))
            result_row.append(sa.gender(obj))
            result_row.append(sa.birth_date(obj))
            result_row.append(sa.birth_place(obj))
            result_row.append(sa.death_date(obj))
            result_row.append(sa.death_place(obj))
            result_row.append(sa.name(sa.spouse(obj)))
            result_row.append("num_parents")
            result_row.append("num_marriages")
            result_row.append("num_children")
            result_row.append("num_notes")
            result_row.append(str(obj.private))
            result_row.append("tags")
            result_row.append(format_time(obj.change))
            results.append(result_row)
        return results

table_map = {}
table_map["person"] = gPerson

def get_database(dirpath):
    dbid = get_dbid_from_path(dirpath)
    database = make_database(dbid)
    database.load(dirpath, None, update=False)
    return database

def get_table_shape(dirpath, table):
    database = get_database(dirpath)
    obj = table_map[table](database)
    results = {}
    results["rows"] = obj.get_rows()
    results["cols"] = obj.get_cols()
    results["column_labels"] = obj.get_column_labels()
    results["column_widths"] = obj.get_column_widths()
    database.close(update=False)
    return results

class Database():
    def __init__(self, name, dirpath, path_name, last,
                 tval, enable, stock_id, backend_type):
        self.name = name
        self.dirpath = dirpath
        self.path_name = path_name
        self.last = last
        self.tval = tval
        self.enable = enable
        self.stock_id = stock_id
        self.backend_type = backend_type

    def to_json(self):
        return {
            "name": self.name,
            "dirpath": self.dirpath,
            "path_name": self.path_name,
            "last": self.last,
            "tval": self.tval,
            "enable": self.enable,
            "stock_id": self.stock_id,
            "backend_type": self.backend_type,
        }

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /gprime_server/get_example endpoint!!"
        }))

class databases(APIHandler):
    @tornado.web.authenticated
    def get(self):
        data = []
        for row in DBMAN.current_names:
            data.append(Database(*row).to_json())
        self.finish(json.dumps({
            "data": data
        }))

class table_schema(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        results = get_table_shape(input_data["dirpath"], input_data["table"])
        self.finish(json.dumps(results))

class table_page(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        table = input_data["table"]
        dirpath = input_data["dirpath"]
        row_span = input_data["row"]
        col_span = input_data["col"]
        database = get_database(dirpath)
        print("getting", table, row_span, col_span)
        obj = table_map[table](database)
        results = obj.get(row_span, col_span)
        self.finish(json.dumps(results))

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = []

    route_pattern = url_path_join(base_url, "gprime_server", "databases")
    handlers += [(route_pattern, databases)]

    route_pattern = url_path_join(base_url, "gprime_server", "table_schema")
    handlers += [(route_pattern, table_schema)]

    route_pattern = url_path_join(base_url, "gprime_server", "table_page")
    handlers += [(route_pattern, table_page)]

    web_app.add_handlers(host_pattern, handlers)
