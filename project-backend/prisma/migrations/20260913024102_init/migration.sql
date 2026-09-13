-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "topic_summaries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "props" TEXT NOT NULL,
    "types" TEXT NOT NULL
);
