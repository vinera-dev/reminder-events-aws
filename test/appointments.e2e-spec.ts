import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { Clock } from './../src/appointments/clock.js';
import { AppModule } from './../src/app.module.js';

class FixedClock extends Clock {
  now(): Date {
    return new Date('2030-05-10T12:00:00Z');
  }
}

const validBody = {
  ownerName: 'Ana Souza',
  ownerEmail: 'ana@example.com',
  petName: 'Thor',
  service: 'consultation',
  scheduledAt: '2030-05-10T14:00:00Z',
};

describe('Appointments (e2e)', () => {
  let app: INestApplication<App>;

  const http = () => request(app.getHttpServer());
  const book = (overrides: Record<string, unknown> = {}) =>
    http()
      .post('/appointments')
      .send({ ...validBody, ...overrides });

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Clock)
      .useClass(FixedClock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates an appointment', async () => {
    const response = await book();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      petName: 'Thor',
      status: 'scheduled',
      scheduledAt: '2030-05-10T14:00:00.000Z',
    });
    expect(response.body.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects an invalid payload with 400', async () => {
    const response = await book({ ownerEmail: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a past time with 400', async () => {
    const response = await book({ scheduledAt: '2030-05-09T14:00:00Z' });

    expect(response.status).toBe(400);
  });

  it('rejects a double booking with 409', async () => {
    await book();
    const response = await book({ petName: 'Mel' });

    expect(response.status).toBe(409);
  });

  it('reschedules an appointment', async () => {
    const created = await book();

    const response = await http()
      .patch(`/appointments/${created.body.id}/reschedule`)
      .send({ scheduledAt: '2030-05-11T09:00:00Z' });

    expect(response.status).toBe(200);
    expect(response.body.scheduledAt).toBe('2030-05-11T09:00:00.000Z');
  });

  it('rejects a reschedule onto a taken slot with 409', async () => {
    const created = await book();
    await book({ scheduledAt: '2030-05-10T15:00:00Z' });

    const response = await http()
      .patch(`/appointments/${created.body.id}/reschedule`)
      .send({ scheduledAt: '2030-05-10T15:00:00Z' });

    expect(response.status).toBe(409);
  });

  it('returns 404 for an unknown appointment', async () => {
    const response = await http()
      .patch(`/appointments/${randomUUID()}/reschedule`)
      .send({ scheduledAt: '2030-05-11T09:00:00Z' });

    expect(response.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const response = await http().post('/appointments/not-a-uuid/cancel');

    expect(response.status).toBe(400);
  });

  it('cancels an appointment and frees the slot', async () => {
    const created = await book();

    const cancelled = await http().post(
      `/appointments/${created.body.id}/cancel`,
    );
    const rebooked = await book({ petName: 'Mel' });

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe('cancelled');
    expect(rebooked.status).toBe(201);
  });

  it('rejects cancelling twice with 409', async () => {
    const created = await book();
    await http().post(`/appointments/${created.body.id}/cancel`);

    const response = await http().post(
      `/appointments/${created.body.id}/cancel`,
    );

    expect(response.status).toBe(409);
  });
});
