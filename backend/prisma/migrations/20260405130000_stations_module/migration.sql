-- RedefineTable ChargingStation (add lifecycle/metrics fields)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_ChargingStation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "capacityKw" REAL NOT NULL DEFAULT 0,
    "currentLoadKw" REAL NOT NULL DEFAULT 0,
    "totalChargers" INTEGER NOT NULL DEFAULT 1,
    "activeChargers" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "lastMaintenanceAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_ChargingStation" (
    "id", "name", "code", "address", "city", "status", "capacityKw", "currentLoadKw",
    "totalChargers", "activeChargers", "revenue", "lastMaintenanceAt", "notes", "createdAt", "updatedAt"
)
SELECT
    "id",
    "name",
    'ST-' || substr(upper(replace("id", '-', '')), 1, 6),
    "address",
    NULL,
    'CREATED',
    0,
    0,
    1,
    0,
    0,
    NULL,
    NULL,
    "createdAt",
    "updatedAt"
FROM "ChargingStation";

DROP TABLE "ChargingStation";
ALTER TABLE "new_ChargingStation" RENAME TO "ChargingStation";
CREATE UNIQUE INDEX "ChargingStation_code_key" ON "ChargingStation"("code");

-- RedefineTable Connector (add charger fields)
CREATE TABLE "new_Connector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "powerKw" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Connector_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "ChargingStation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Connector" (
    "id", "stationId", "label", "type", "powerKw", "status", "isAvailable", "createdAt", "updatedAt"
)
SELECT
    "id",
    "stationId",
    'CH-' || substr(upper(replace("id", '-', '')), 1, 4),
    "type",
    "powerKw",
    CASE WHEN "isAvailable" = 1 THEN 'AVAILABLE' ELSE 'MAINTENANCE' END,
    "isAvailable",
    "createdAt",
    "updatedAt"
FROM "Connector";

DROP TABLE "Connector";
ALTER TABLE "new_Connector" RENAME TO "Connector";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
