import json
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

if 'GRAMPS_RESOURCES' not in os.environ:
    print("WARNING: GRAMPS_RESOURCES is not defined")

from .db import (
    get_database_from_dirpath,
    get_databases,
    get_table_data,
    get_table,
)

class databases(APIHandler):
    @tornado.web.authenticated
    def get(self):
        data = [database.to_json() for database in get_databases()]
        self.finish(json.dumps({
            "data": data
        }))

class table_data(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        results = get_table_data(input_data["dirpath"], input_data["table"])
        self.finish(json.dumps(results))

class table_page(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        table_name = input_data["table"]
        dirpath = input_data["dirpath"]
        row_span = input_data["row"]
        col_span = input_data["col"]
        database = get_database_from_dirpath(dirpath)
        print("getting", table_name, row_span, col_span)
        table = get_table(database, table_name)
        results = table.get(row_span, col_span)
        database.close(update=False)
        self.finish(json.dumps(results))

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = []

    route_pattern = url_path_join(base_url, "gprime", "databases")
    handlers += [(route_pattern, databases)]

    route_pattern = url_path_join(base_url, "gprime", "table_data")
    handlers += [(route_pattern, table_data)]

    route_pattern = url_path_join(base_url, "gprime", "table_page")
    handlers += [(route_pattern, table_page)]

    web_app.add_handlers(host_pattern, handlers)
