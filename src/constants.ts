import {Table} from "./database";

export const TABLES = [
    new Table("person", "People"),
    new Table("family", "Families"),
    new Table("event", "Events"),
    new Table("place", "Places"),
    new Table("source", "Sources"),
    new Table("citation", "Citations"),
    new Table("repository", "Repositories"),
    new Table("media", "Media"),
    new Table("note", "Notes")
]
