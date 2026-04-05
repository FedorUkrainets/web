import { ChargingSessionStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../utils/api-error';

const createSessionSchema = z.object({
  userId: z.string().min(1),
  stationId: z.string().min(1),
  connectorId: z.string().min(1),
  energyKwh: z.number().nonnegative().optional(),
});

const updateEnergySchema = z.object({
  energyKwh: z.number().nonnegative().optional(),
});

const ALLOWED_TRANSITIONS: Record<ChargingSessionStatus, ChargingSessionStatus[]> = {
  CREATED: [ChargingSessionStatus.ACTIVE],
  ACTIVE: [ChargingSessionStatus.COMPLETED, ChargingSessionStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export class ChargingSessionService {
  private validateStatusTransition(current: ChargingSessionStatus, next: ChargingSessionStatus) {
    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new ApiError(409, `Invalid status transition from ${current} to ${next}`);
    }
  }

  async create(input: unknown) {
    const data = createSessionSchema.parse(input);

    const [user, station, connector] = await Promise.all([
      prisma.user.findUnique({ where: { id: data.userId } }),
      prisma.chargingStation.findUnique({ where: { id: data.stationId } }),
      prisma.connector.findUnique({ where: { id: data.connectorId } }),
    ]);

    if (!user) throw new ApiError(404, 'User not found');
    if (!station) throw new ApiError(404, 'Station not found');
    if (!connector) throw new ApiError(404, 'Connector not found');
    if (connector.stationId !== data.stationId) {
      throw new ApiError(400, 'Connector does not belong to station');
    }

    return prisma.chargingSession.create({
      data: {
        userId: data.userId,
        stationId: data.stationId,
        connectorId: data.connectorId,
        energyKwh: data.energyKwh,
        status: ChargingSessionStatus.CREATED,
      },
    });
  }

  async findAll() {
    return prisma.chargingSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
        station: true,
        connector: true,
      },
    });
  }

  async findById(id: string) {
    const session = await prisma.chargingSession.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
        station: true,
        connector: true,
      },
    });

    if (!session) throw new ApiError(404, 'Charging session not found');
    return session;
  }

  async start(id: string) {
    const session = await prisma.chargingSession.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, 'Charging session not found');

    this.validateStatusTransition(session.status, ChargingSessionStatus.ACTIVE);

    return prisma.chargingSession.update({
      where: { id },
      data: { status: ChargingSessionStatus.ACTIVE, startedAt: new Date() },
    });
  }

  async complete(id: string, input: unknown) {
    const body = updateEnergySchema.parse(input);
    const session = await prisma.chargingSession.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, 'Charging session not found');

    this.validateStatusTransition(session.status, ChargingSessionStatus.COMPLETED);

    return prisma.chargingSession.update({
      where: { id },
      data: {
        status: ChargingSessionStatus.COMPLETED,
        endedAt: new Date(),
        energyKwh: body.energyKwh ?? session.energyKwh,
      },
    });
  }

  async cancel(id: string) {
    const session = await prisma.chargingSession.findUnique({ where: { id } });
    if (!session) throw new ApiError(404, 'Charging session not found');

    this.validateStatusTransition(session.status, ChargingSessionStatus.CANCELLED);

    return prisma.chargingSession.update({
      where: { id },
      data: {
        status: ChargingSessionStatus.CANCELLED,
        endedAt: new Date(),
      },
    });
  }
}

export const chargingSessionService = new ChargingSessionService();
