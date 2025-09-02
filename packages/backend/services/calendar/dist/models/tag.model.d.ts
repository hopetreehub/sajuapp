export interface Tag {
    id: string;
    name: string;
    color: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}
export interface EventTag {
    event_id: string;
    tag_id: string;
    created_at: string;
}
export declare const createTagTable = "\n  CREATE TABLE IF NOT EXISTS tags (\n    id TEXT PRIMARY KEY,\n    name TEXT NOT NULL,\n    color TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    UNIQUE(name, user_id)\n  )\n";
export declare const createEventTagTable = "\n  CREATE TABLE IF NOT EXISTS event_tags (\n    event_id TEXT NOT NULL,\n    tag_id TEXT NOT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    PRIMARY KEY (event_id, tag_id),\n    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,\n    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE\n  )\n";
//# sourceMappingURL=tag.model.d.ts.map