---
title: Content Revisions & Time Machine
slug: revisions-and-diffs
description: How FrameX preserves immutable historical snapshots and provides visual diffing and restoration.
category: Content Studio
order: 2
badge: Studio
---

# Content Revisions & Time Machine

In enterprise content management, accidental overwrites and lost work represent critical risks. FrameX solves this with an **append-only, immutable revision engine** powered by `RevisionService`.

---

## Revision Mechanics

Every time an author saves changes in Content Studio:
1. An immutable snapshot row is created in `content_revisions` containing the title, excerpt, `body_html`, `body_json`, change summary, author ID, and timestamp.
2. The parent `contents` row points its `current_revision_id` foreign key to this new revision.
3. Historical revisions are never updated or deleted during edits.

---

## Restoring Revisions

Authors can open the **Time Machine** revision history drawer, review previous versions side-by-side, inspect visual diffs, and restore any previous version with a single click.

Restoring a revision does not delete future revisions; it creates a new snapshot pointing back to the restored content state.
