"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventTagTable = exports.createTagTable = void 0;
exports.createTagTable = `
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, user_id)
  )
`;
exports.createEventTagTable = `
  CREATE TABLE IF NOT EXISTS event_tags (
    event_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, tag_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )
`;
//# sourceMappingURL=tag.model.js.map