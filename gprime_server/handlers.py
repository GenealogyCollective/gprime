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
        data = DBMAN.family_tree_list()
        self.finish(json.dumps({
            "data": data
        }))

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = []
    #route_pattern = url_path_join(base_url, "gprime_server", "get_example")
    #handlers = [(route_pattern, RouteHandler)]

    route_pattern = url_path_join(base_url, "gprime_server", "get_family_trees")
    handlers += [(route_pattern, FamilyTrees)]

    web_app.add_handlers(host_pattern, handlers)
