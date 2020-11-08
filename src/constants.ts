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

export namespace CommandIDs {
    export const open_table = 'gprime:open-table-{database_name}-{table_name}';
}

export function format(template: string, obj: any) {
    return template.replace(/\{\s*([^}\s]+)\s*\}/g, function(m, p1, offset, string) {
        return obj[p1]
    })
}
