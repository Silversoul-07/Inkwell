/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentReply` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Comment_userId_idx";

-- DropIndex
DROP INDEX "Comment_sceneId_idx";

-- DropIndex
DROP INDEX "CommentReply_commentId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Comment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CommentReply";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" TEXT,
    "role" TEXT,
    "description" TEXT,
    "traits" TEXT,
    "background" TEXT,
    "relationships" TEXT,
    "goals" TEXT,
    "avatar" TEXT,
    "images" TEXT,
    "aliases" TEXT,
    "occupation" TEXT,
    "appearance" TEXT,
    "voice" TEXT,
    "equipment" TEXT,
    "abilities" TEXT,
    "fears" TEXT,
    "secrets" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "color" TEXT,
    "isMainCharacter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("age", "background", "createdAt", "description", "goals", "id", "name", "projectId", "relationships", "role", "traits", "updatedAt") SELECT "age", "background", "createdAt", "description", "goals", "id", "name", "projectId", "relationships", "role", "traits", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_projectId_idx" ON "Character"("projectId");
CREATE TABLE "new_LorebookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "keys" TEXT,
    "triggerMode" TEXT NOT NULL DEFAULT 'auto',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "searchable" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "regexPattern" TEXT,
    "contextStrategy" TEXT NOT NULL DEFAULT 'full',
    "thumbnail" TEXT,
    "images" TEXT,
    "subcategory" TEXT,
    "relatedEntries" TEXT,
    "tags" TEXT,
    "aliases" TEXT,
    "color" TEXT,
    "summary" TEXT,
    "spoilerLevel" INTEGER NOT NULL DEFAULT 0,
    "timeframe" TEXT,
    "isCanon" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LorebookEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LorebookEntry" ("category", "contextStrategy", "createdAt", "id", "key", "keys", "lastUsed", "priority", "projectId", "regexPattern", "searchable", "triggerMode", "updatedAt", "useCount", "value") SELECT "category", "contextStrategy", "createdAt", "id", "key", "keys", "lastUsed", "priority", "projectId", "regexPattern", "searchable", "triggerMode", "updatedAt", "useCount", "value" FROM "LorebookEntry";
DROP TABLE "LorebookEntry";
ALTER TABLE "new_LorebookEntry" RENAME TO "LorebookEntry";
CREATE INDEX "LorebookEntry_projectId_category_idx" ON "LorebookEntry"("projectId", "category");
CREATE INDEX "LorebookEntry_projectId_isArchived_idx" ON "LorebookEntry"("projectId", "isArchived");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
