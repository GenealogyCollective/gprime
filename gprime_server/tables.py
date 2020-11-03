from gramps.plugins.view.personlistview import PersonListView
from gramps.plugins.view.citationlistview import CitationListView
from gramps.plugins.view.eventview import EventView
from gramps.plugins.view.familyview import FamilyView
from gramps.plugins.view.mediaview import MediaView
from gramps.plugins.view.noteview import NoteView
from gramps.plugins.view.placelistview import PlaceListView
from gramps.plugins.view.repoview import RepositoryView
from gramps.plugins.view.sourceview import SourceView

from gramps.gui.views.treemodels.peoplemodel import PersonListModel
from gramps.gui.views.treemodels.citationlistmodel import CitationListModel
from gramps.gui.views.treemodels.eventmodel import EventModel
from gramps.gui.views.treemodels.familymodel import FamilyModel
from gramps.gui.views.treemodels.mediamodel import MediaModel
from gramps.gui.views.treemodels.notemodel import NoteModel
from gramps.gui.views.treemodels.placemodel import PlaceListModel
from gramps.gui.views.treemodels.repomodel import RepositoryModel
from gramps.gui.views.treemodels.sourcemodel import SourceModel

from .base_table import BaseTable

class Person(BaseTable):
    VIEW = PersonListView
    MODEL = PersonListModel
    INDEX = "surname"

class Citation(BaseTable):
    VIEW = CitationListView
    MODEL = CitationListModel
    INDEX = "gramps_id"

class Event(BaseTable):
    VIEW = EventView
    MODEL = EventModel
    INDEX = "gramps_id"

class Family(BaseTable):
    VIEW = FamilyView
    MODEL = FamilyModel
    INDEX = "gramps_id"

class Media(BaseTable):
    VIEW = MediaView
    MODEL = MediaModel
    INDEX = "gramps_id"

class Note(BaseTable):
    VIEW = NoteView
    MODEL = NoteModel
    INDEX = "gramps_id"

class Place(BaseTable):
    VIEW = PlaceListView
    MODEL = PlaceListModel
    INDEX = "gramps_id"

class Repository(BaseTable):
    VIEW = RepositoryView
    MODEL = RepositoryModel
    INDEX = "gramps_id"

class Source(BaseTable):
    VIEW = SourceView
    MODEL = SourceModel
    INDEX = "gramps_id"

table_map = {}
table_map["person"] = Person
table_map["citation"] = Citation
table_map["event"] = Event
table_map["family"] = Family
table_map["media"] = Media
table_map["note"] = Note
table_map["place"] = Place
table_map["repository"] = Repository
table_map["source"] = Source
