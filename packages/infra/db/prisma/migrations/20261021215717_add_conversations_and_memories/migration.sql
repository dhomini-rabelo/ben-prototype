-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);
