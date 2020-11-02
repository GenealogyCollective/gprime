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

DBSTATE = DbState()
DBMAN = CLIDbManager(DBSTATE)

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

class FamilyTrees(APIHandler):
    @tornado.web.authenticated
    def get(self):
        data = []
        for row in DBMAN.current_names:
            data.append(Database(*row).to_json())
        self.finish(json.dumps({
            "data": data
        }))

class FamilyTreeStats(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        print(input_data["path_name"])
        results = {"rows": 42}
        self.finish(json.dumps(results))

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = []
    #route_pattern = url_path_join(base_url, "gprime_server", "get_example")
    #handlers = [(route_pattern, RouteHandler)]

    route_pattern = url_path_join(base_url, "gprime_server", "get_family_trees")
    handlers += [(route_pattern, FamilyTrees)]

    route_pattern = url_path_join(base_url, "gprime_server", "get_family_tree_stats")
    handlers += [(route_pattern, FamilyTreeStats)]

    web_app.add_handlers(host_pattern, handlers)
