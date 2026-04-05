import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../utils/api-error';

const connectorSchema = z.object({
  type: z.string().min(1),
  powerKw: z.number().positive(),
  isAvailable: z.boolean().optional(),
});

const createStationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  connectors: z.array(connectorSchema).min(1),
  forceFail: z.boolean().optional(),
});

export class StationService {
  async createStationWithConnectors(input: unknown) {
    const data = createStationSchema.parse(input);

    const created = await prisma.$transaction(async (tx) => {
      const station = await tx.chargingStation.create({
        data: {
          name: data.name,
          address: data.address,
        },
      });

      for (const connector of data.connectors) {
        await tx.connector.create({
          data: {
            stationId: station.id,
            type: connector.type,
            powerKw: connector.powerKw,
            isAvailable: connector.isAvailable ?? true,
          },
        });
      }

      if (data.forceFail) {
        throw new ApiError(400, 'Forced failure for rollback demo');
      }

      return tx.chargingStation.findUnique({
        where: { id: station.id },
        include: { connectors: true },
      });
    });

    return created;
  }

  async findAll() {
    return prisma.chargingStation.findMany({
      include: { connectors: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const station = await prisma.chargingStation.findUnique({
      where: { id },
      include: { connectors: true },
    });

    if (!station) throw new ApiError(404, 'Station not found');
    return station;
  }
}

export const stationService = new StationService();
