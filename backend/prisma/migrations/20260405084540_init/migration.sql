-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChargingStation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Connector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "powerKw" REAL NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Connector_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "ChargingStation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChargingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "energyKwh" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChargingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChargingSession_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "ChargingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChargingSession_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
