import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from './appointment.js';
import { AppointmentService } from './appointment-service.enum.js';
import { AppointmentsService } from './appointments.service.js';
import { Clock } from './clock.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { InMemoryEventPublisher } from '../events/in-memory-event-publisher.js';
import { InMemoryAppointmentsRepository } from './in-memory-appointments.repository.js';

class FixedClock extends Clock {
  constructor(private readonly current: Date) {
    super();
  }
  now(): Date {
    return this.current;
  }
}

const NOW = new Date('2030-05-10T12:00:00Z');

const payload = (overrides: Partial<CreateAppointmentDto> = {}) =>
  Object.assign(new CreateAppointmentDto(), {
    ownerName: 'Ana Souza',
    ownerEmail: 'ana@example.com',
    petName: 'Thor',
    service: AppointmentService.Consultation,
    scheduledAt: '2030-05-10T14:00:00Z',
    ...overrides,
  });

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let events: InMemoryEventPublisher;

  beforeEach(() => {
    events = new InMemoryEventPublisher();
    service = new AppointmentsService(
      new InMemoryAppointmentsRepository(),
      new FixedClock(NOW),
      events,
    );
  });

  describe('create', () => {
    it('publishes appointment.created with the booking snapshot', async () => {
      const appointment = await service.create(payload());

      expect(events.published).toHaveLength(1);
      expect(events.published[0]).toMatchObject({
        type: 'appointment.created',
        version: 1,
        occurredAt: NOW.toISOString(),
        data: {
          appointmentId: appointment.id,
          ownerEmail: 'ana@example.com',
          petName: 'Thor',
          service: 'consultation',
          scheduledAt: '2030-05-10T14:00:00.000Z',
        },
      });
    });

    it('publishes nothing when the booking is rejected', async () => {
      await service.create(payload());
      events.clear();

      await expect(service.create(payload())).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(
        service.create(payload({ scheduledAt: '2030-05-09T14:00:00Z' })),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(events.published).toEqual([]);
    });

    it('stores a scheduled appointment with an id', async () => {
      const appointment = await service.create(payload());

      expect(appointment.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(appointment.status).toBe(AppointmentStatus.Scheduled);
      expect(appointment.scheduledAt).toEqual(new Date('2030-05-10T14:00:00Z'));
    });

    it('rejects a time in the past', async () => {
      await expect(
        service.create(payload({ scheduledAt: '2030-05-10T11:59:59Z' })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects the current instant', async () => {
      await expect(
        service.create(payload({ scheduledAt: '2030-05-10T12:00:00Z' })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a double booking of the same instant', async () => {
      await service.create(payload());

      await expect(
        service.create(
          payload({ petName: 'Mel', scheduledAt: '2030-05-10T11:00:00-03:00' }),
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('accepts a different slot', async () => {
      await service.create(payload());

      await expect(
        service.create(payload({ scheduledAt: '2030-05-10T15:00:00Z' })),
      ).resolves.toBeDefined();
    });

    it('frees the slot after cancellation', async () => {
      const first = await service.create(payload());
      await service.cancel(first.id);

      await expect(service.create(payload())).resolves.toBeDefined();
    });
  });

  describe('reschedule', () => {
    it('publishes appointment.rescheduled with the previous time', async () => {
      const created = await service.create(payload());
      events.clear();

      await service.reschedule(created.id, '2030-05-11T09:00:00Z');

      expect(events.published).toHaveLength(1);
      expect(events.published[0]).toMatchObject({
        type: 'appointment.rescheduled',
        data: {
          appointmentId: created.id,
          scheduledAt: '2030-05-11T09:00:00.000Z',
          previousScheduledAt: '2030-05-10T14:00:00.000Z',
        },
      });
    });

    it('publishes nothing when the reschedule is rejected', async () => {
      const created = await service.create(payload());
      events.clear();

      await expect(
        service.reschedule(created.id, '2030-05-09T09:00:00Z'),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(events.published).toEqual([]);
    });

    it('moves the appointment to the new time', async () => {
      const created = await service.create(payload());

      const moved = await service.reschedule(
        created.id,
        '2030-05-11T09:00:00Z',
      );

      expect(moved.id).toBe(created.id);
      expect(moved.scheduledAt).toEqual(new Date('2030-05-11T09:00:00Z'));
    });

    it('frees the old slot', async () => {
      const created = await service.create(payload());
      await service.reschedule(created.id, '2030-05-11T09:00:00Z');

      await expect(service.create(payload())).resolves.toBeDefined();
    });

    it('rejects a past time', async () => {
      const created = await service.create(payload());

      await expect(
        service.reschedule(created.id, '2030-05-09T09:00:00Z'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a slot taken by another appointment', async () => {
      const created = await service.create(payload());
      await service.create(payload({ scheduledAt: '2030-05-10T15:00:00Z' }));

      await expect(
        service.reschedule(created.id, '2030-05-10T15:00:00Z'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects an unknown id', async () => {
      await expect(
        service.reschedule('missing', '2030-05-11T09:00:00Z'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a cancelled appointment', async () => {
      const created = await service.create(payload());
      await service.cancel(created.id);

      await expect(
        service.reschedule(created.id, '2030-05-11T09:00:00Z'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('cancel', () => {
    it('publishes appointment.cancelled with the cancelled time', async () => {
      const created = await service.create(payload());
      events.clear();

      await service.cancel(created.id);

      expect(events.published).toHaveLength(1);
      expect(events.published[0]).toMatchObject({
        type: 'appointment.cancelled',
        data: {
          appointmentId: created.id,
          scheduledAt: '2030-05-10T14:00:00.000Z',
        },
      });
    });

    it('publishes nothing when cancelling twice', async () => {
      const created = await service.create(payload());
      await service.cancel(created.id);
      events.clear();

      await expect(service.cancel(created.id)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(events.published).toEqual([]);
    });

    it('marks the appointment as cancelled', async () => {
      const created = await service.create(payload());

      const cancelled = await service.cancel(created.id);

      expect(cancelled.status).toBe(AppointmentStatus.Cancelled);
    });

    it('rejects an unknown id', async () => {
      await expect(service.cancel('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects cancelling twice', async () => {
      const created = await service.create(payload());
      await service.cancel(created.id);

      await expect(service.cancel(created.id)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
