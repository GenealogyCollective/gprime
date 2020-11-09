import {TableType} from "./database";

export const TABLE_TYPES = [
    new TableType("person", "People"),
    new TableType("family", "Families"),
    new TableType("event", "Events"),
    new TableType("place", "Places"),
    new TableType("source", "Sources"),
    new TableType("citation", "Citations"),
    new TableType("repository", "Repositories"),
    new TableType("media", "Media"),
    new TableType("note", "Notes")
]

export namespace CommandIDs {
    export const open_table = 'gprime:open-table-{database_name}-{table_name}';
}

export function format(template: string, obj: any) {
    return template.replace(/\{\s*([^}\s]+)\s*\}/g, function(m, p1, offset, string) {
        return obj[p1]
    })
}
