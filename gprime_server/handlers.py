import pickle
import json
import re
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

if 'GRAMPS_RESOURCES' not in os.environ:
    print("WARNING: GRAMPS_RESOURCES is not defined")

from gramps.gen.dbstate import DbState
from gramps.cli.clidbman import CLIDbManager
from gramps.gen.db.utils import make_database, get_dbid_from_path
from gramps.gen.lib import Person as GPerson

DBSTATE = DbState()
DBMAN = CLIDbManager(DBSTATE)

class Person():
    def get_rows(self, database):
        return database.get_number_of_people()
    def get_cols(self, database):
        return 20 # database.get_number_of_people()
    def get(self, database, row_span, col_span):
        database.dbapi.execute(
            "SELECT blob_data FROM person ORDER BY surname "
            "LIMIT %s, %s;" % (row_span[0],
                               row_span[1] - row_span[0]))
        results = self.select_cols(database.dbapi.fetchall(), col_span)
        return results
    def select_cols(self, raw_data, col_span):
        results = []
        for row in raw_data:
            data = pickle.loads(row[0])
            obj = GPerson(data)
            result_row = []
            #for col in range(col_span[0], col_span[1] + 1):
            #    result_row.append(obj.)
            result_row.append(obj.gramps_id)
            result_row.append(obj.gender)
            result_row.append(obj.get_primary_name().get_surname())
            result_row.append(obj.get_primary_name().get_first_name())
            results.append(result_row)
        return results

table_map = {}
table_map["person"] = Person()

def get_database(dirpath):
    dbid = get_dbid_from_path(dirpath)
    database = make_database(dbid)
    database.load(dirpath, None, update=False)
    return database

def get_table_shape(dirpath, table):
    database = get_database(dirpath)
    results = {}
    results["rows"] = table_map[table].get_rows(database)
    results["cols"] = table_map[table].get_cols(database)
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
        results = table_map[table].get(database, row_span, col_span)
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
