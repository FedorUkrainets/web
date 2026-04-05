import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

type SeedStation = {
  name: string;
  code: string;
  address: string;
  city: string;
  status: 'CREATED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  capacityKw: number;
  currentLoadKw: number;
  totalChargers: number;
  activeChargers: number;
  revenue: number;
  lastMaintenanceAt: string;
  notes: string;
};

const stationSeeds: SeedStation[] = [
  {
    name: 'Downtown Plaza',
    code: 'ST-001',
    address: '125 Main St',
    city: 'San Francisco',
    status: 'ACTIVE',
    capacityKw: 320,
    currentLoadKw: 218,
    totalChargers: 8,
    activeChargers: 6,
    revenue: 58200,
    lastMaintenanceAt: '2026-02-14T10:00:00.000Z',
    notes: 'High traffic business district.',
  },
  {
    name: 'Shopping Mall West',
    code: 'ST-002',
    address: '840 Market Ave',
    city: 'San Jose',
    status: 'CREATED',
    capacityKw: 180,
    currentLoadKw: 42,
    totalChargers: 6,
    activeChargers: 2,
    revenue: 21900,
    lastMaintenanceAt: '2026-03-04T10:00:00.000Z',
    notes: 'Family-focused weekend peak.',
  },
  {
    name: 'Airport Terminal',
    code: 'ST-003',
    address: '1 Airport Way',
    city: 'Oakland',
    status: 'COMPLETED',
    capacityKw: 400,
    currentLoadKw: 0,
    totalChargers: 10,
    activeChargers: 0,
    revenue: 73300,
    lastMaintenanceAt: '2026-01-21T10:00:00.000Z',
    notes: 'Phase finished for current contract.',
  },
  {
    name: 'Business Park',
    code: 'ST-004',
    address: '77 Innovation Dr',
    city: 'Palo Alto',
    status: 'CANCELLED',
    capacityKw: 250,
    currentLoadKw: 0,
    totalChargers: 5,
    activeChargers: 0,
    revenue: 9700,
    lastMaintenanceAt: '2025-12-18T10:00:00.000Z',
    notes: 'Expansion cancelled by owner.',
  },
  {
    name: 'City Center Hub',
    code: 'ST-005',
    address: '500 Center Blvd',
    city: 'San Mateo',
    status: 'ACTIVE',
    capacityKw: 280,
    currentLoadKw: 132,
    totalChargers: 7,
    activeChargers: 4,
    revenue: 46850,
    lastMaintenanceAt: '2026-02-27T10:00:00.000Z',
    notes: 'Balanced traffic throughout the week.',
  },
];

async function seedStations() {
  for (const station of stationSeeds) {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.$queryRawUnsafe<{ id: string }[]>(
        'SELECT id FROM ChargingStation WHERE code = ?',
        station.code,
      );

      const stationId = existing[0]?.id ?? `st_${randomUUID().replace(/-/g, '').slice(0, 20)}`;

      if (existing.length > 0) {
        await tx.$executeRawUnsafe(
          `UPDATE ChargingStation
           SET name = ?, address = ?, city = ?, status = ?, capacityKw = ?, currentLoadKw = ?, totalChargers = ?, activeChargers = ?, revenue = ?, lastMaintenanceAt = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          station.name,
          station.address,
          station.city,
          station.status,
          station.capacityKw,
          station.currentLoadKw,
          station.totalChargers,
          station.activeChargers,
          station.revenue,
          station.lastMaintenanceAt,
          station.notes,
          stationId,
        );
      } else {
        await tx.$executeRawUnsafe(
          `INSERT INTO ChargingStation
          (id, name, code, address, city, status, capacityKw, currentLoadKw, totalChargers, activeChargers, revenue, lastMaintenanceAt, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          stationId,
          station.name,
          station.code,
          station.address,
          station.city,
          station.status,
          station.capacityKw,
          station.currentLoadKw,
          station.totalChargers,
          station.activeChargers,
          station.revenue,
          station.lastMaintenanceAt,
          station.notes,
        );
      }

      await tx.$executeRawUnsafe('DELETE FROM Connector WHERE stationId = ?', stationId);

      const connectorPower = Number((station.capacityKw / station.totalChargers).toFixed(2));
      for (let i = 1; i <= station.totalChargers; i += 1) {
        const status = station.status === 'ACTIVE'
          ? (i <= station.activeChargers ? 'IN_USE' : 'AVAILABLE')
          : 'MAINTENANCE';
        await tx.$executeRawUnsafe(
          `INSERT INTO Connector
           (id, stationId, label, type, powerKw, status, isAvailable, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          `cn_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
          stationId,
          `CH-${String(i).padStart(2, '0')}`,
          i % 2 === 0 ? 'CCS2' : 'Type2',
          connectorPower,
          status,
          status !== 'MAINTENANCE' ? 1 : 0,
        );
      }
    });
  }
}

async function ensureAdmin() {
  const email = 'admin@ev.local';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({
    data: {
      email,
      fullName: 'Demo Admin',
      role: UserRole.ADMIN,
      passwordHash,
    },
  });
}

async function main() {
  await ensureAdmin();
  await seedStations();
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
