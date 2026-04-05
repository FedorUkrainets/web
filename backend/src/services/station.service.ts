import { z } from 'zod';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { ApiError } from '../utils/api-error';

const stationStatuses = ['CREATED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;
const chargerStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'] as const;
type StationStatus = (typeof stationStatuses)[number];
type ChargerStatus = (typeof chargerStatuses)[number];

const stationStatusSchema = z.enum(stationStatuses);

const createStationSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(20).optional(),
  address: z.string().min(1),
  city: z.string().min(1).optional(),
  status: stationStatusSchema.optional().default('CREATED'),
  capacityKw: z.number().nonnegative(),
  currentLoadKw: z.number().nonnegative(),
  totalChargers: z.number().int().min(1),
  activeChargers: z.number().int().min(0),
  revenue: z.number().nonnegative().optional().default(0),
  lastMaintenanceAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  forceFail: z.boolean().optional(),
});

const updateStatusSchema = z.object({
  status: stationStatusSchema,
});

const ALLOWED_TRANSITIONS: Record<StationStatus, StationStatus[]> = {
  CREATED: ['ACTIVE'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

type StationRow = {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string | null;
  status: StationStatus;
  capacityKw: number;
  currentLoadKw: number;
  totalChargers: number;
  activeChargers: number;
  revenue: number;
  lastMaintenanceAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConnectorRow = {
  id: string;
  stationId: string;
  label: string;
  type: string;
  powerKw: number;
  status: ChargerStatus;
  isAvailable: number | boolean;
  createdAt: Date;
  updatedAt: Date;
};

type StationWithConnectors = StationRow & { connectors: ConnectorRow[] };

export class StationService {
  private validateMetrics(data: z.infer<typeof createStationSchema>) {
    if (data.activeChargers > data.totalChargers) {
      throw new ApiError(400, 'activeChargers cannot exceed totalChargers');
    }
    if (data.currentLoadKw > data.capacityKw) {
      throw new ApiError(400, 'currentLoadKw cannot exceed capacityKw');
    }
  }

  private validateStatusTransition(current: StationStatus, next: StationStatus) {
    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new ApiError(409, `Invalid status transition from ${current} to ${next}`);
    }
  }

  private generateStationCode(name: string) {
    const trimmed = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = trimmed.slice(0, 3).padEnd(3, 'X');
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${suffix}`;
  }

  private async loadConnectorsByStationIds(stationIds: string[]) {
    if (stationIds.length === 0) return [];
    const placeholders = stationIds.map(() => '?').join(',');
    return prisma.$queryRawUnsafe<ConnectorRow[]>(
      `SELECT id, stationId, label, type, powerKw, status, isAvailable, createdAt, updatedAt FROM Connector WHERE stationId IN (${placeholders}) ORDER BY label ASC`,
      ...stationIds,
    );
  }

  private composeStationResponse(stations: StationRow[], connectors: ConnectorRow[]): StationWithConnectors[] {
    const byStationId = new Map<string, ConnectorRow[]>();
    for (const connector of connectors) {
      const list = byStationId.get(connector.stationId) ?? [];
      list.push(connector);
      byStationId.set(connector.stationId, list);
    }

    return stations.map((station) => ({
      ...station,
      connectors: byStationId.get(station.id) ?? [],
    }));
  }

  async createStationWithConnectors(input: unknown) {
    const data = createStationSchema.parse(input);
    this.validateMetrics(data);

    const code = data.code ?? this.generateStationCode(data.name);
    const connectorPowerKw = Number((data.capacityKw / data.totalChargers).toFixed(2));

    const createdStation = await prisma.$transaction(async (tx) => {
      const id = randomUUID().replace(/-/g, '');
      const stationId = `st_${id.slice(0, 20)}`;

      await tx.$executeRawUnsafe(
        `INSERT INTO ChargingStation
         (id, name, code, address, city, status, capacityKw, currentLoadKw, totalChargers, activeChargers, revenue, lastMaintenanceAt, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        stationId,
        data.name,
        code,
        data.address,
        data.city ?? null,
        data.status,
        data.capacityKw,
        data.currentLoadKw,
        data.totalChargers,
        data.activeChargers,
        data.revenue,
        data.lastMaintenanceAt ?? null,
        data.notes ?? null,
      );

      for (let i = 1; i <= data.totalChargers; i += 1) {
        const connectorId = `cn_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
        const status: ChargerStatus = i <= data.activeChargers ? 'IN_USE' : 'AVAILABLE';
        await tx.$executeRawUnsafe(
          `INSERT INTO Connector
           (id, stationId, label, type, powerKw, status, isAvailable, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          connectorId,
          stationId,
          `CH-${String(i).padStart(2, '0')}`,
          'CCS2',
          connectorPowerKw,
          status,
          1,
        );
      }

      if (data.forceFail) {
        throw new ApiError(400, 'Forced failure for rollback demo');
      }

      const rows = await tx.$queryRawUnsafe<StationRow[]>(
        'SELECT id, name, code, address, city, status, capacityKw, currentLoadKw, totalChargers, activeChargers, revenue, lastMaintenanceAt, notes, createdAt, updatedAt FROM ChargingStation WHERE id = ?',
        stationId,
      );
      return rows[0];
    });

    const connectors = await this.loadConnectorsByStationIds([createdStation.id]);
    return this.composeStationResponse([createdStation], connectors)[0];
  }

  async findAll() {
    const stations = await prisma.$queryRawUnsafe<StationRow[]>(
      'SELECT id, name, code, address, city, status, capacityKw, currentLoadKw, totalChargers, activeChargers, revenue, lastMaintenanceAt, notes, createdAt, updatedAt FROM ChargingStation ORDER BY createdAt DESC',
    );
    const connectors = await this.loadConnectorsByStationIds(stations.map((s) => s.id));
    return this.composeStationResponse(stations, connectors);
  }

  async findById(id: string) {
    const stations = await prisma.$queryRawUnsafe<StationRow[]>(
      'SELECT id, name, code, address, city, status, capacityKw, currentLoadKw, totalChargers, activeChargers, revenue, lastMaintenanceAt, notes, createdAt, updatedAt FROM ChargingStation WHERE id = ?',
      id,
    );
    if (stations.length === 0) throw new ApiError(404, 'Station not found');
    const connectors = await this.loadConnectorsByStationIds([id]);
    return this.composeStationResponse(stations, connectors)[0];
  }

  async changeStatus(id: string, input: unknown) {
    const { status } = updateStatusSchema.parse(input);
    const stations = await prisma.$queryRawUnsafe<StationRow[]>(
      'SELECT id, name, code, address, city, status, capacityKw, currentLoadKw, totalChargers, activeChargers, revenue, lastMaintenanceAt, notes, createdAt, updatedAt FROM ChargingStation WHERE id = ?',
      id,
    );
    if (stations.length === 0) throw new ApiError(404, 'Station not found');

    this.validateStatusTransition(stations[0].status, status);

    await prisma.$executeRawUnsafe(
      'UPDATE ChargingStation SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      status,
      id,
    );

    return this.findById(id);
  }

  async remove(id: string) {
    const stations = await prisma.$queryRawUnsafe<StationRow[]>(
      'SELECT id FROM ChargingStation WHERE id = ?',
      id,
    );
    if (stations.length === 0) throw new ApiError(404, 'Station not found');

    await prisma.$executeRawUnsafe('DELETE FROM ChargingStation WHERE id = ?', id);
    return { message: 'Station deleted' };
  }
}

export const stationService = new StationService();
