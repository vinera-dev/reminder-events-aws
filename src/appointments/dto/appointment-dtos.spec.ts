import { BadRequestException } from '@nestjs/common';
import { createValidationPipe } from '../validation.js';
import { CreateAppointmentDto } from './create-appointment.dto.js';
import { RescheduleAppointmentDto } from './reschedule-appointment.dto.js';

const pipe = createValidationPipe();

const validate = <T extends object>(
  metatype: new () => T,
  value: unknown,
): Promise<T> => pipe.transform(value, { type: 'body', metatype });

const validPayload = {
  ownerName: 'Ana Souza',
  ownerEmail: 'ana@example.com',
  petName: 'Thor',
  service: 'consultation',
  scheduledAt: '2030-05-10T14:00:00Z',
};

describe('CreateAppointmentDto', () => {
  it('accepts a valid payload and returns a typed instance', async () => {
    const result = await validate(CreateAppointmentDto, validPayload);

    expect(result).toBeInstanceOf(CreateAppointmentDto);
    expect(result.petName).toBe('Thor');
  });

  it('trims surrounding whitespace', async () => {
    const result = await validate(CreateAppointmentDto, {
      ...validPayload,
      petName: '  Thor  ',
    });

    expect(result.petName).toBe('Thor');
  });

  it.each([
    ['missing owner name', { ownerName: undefined }],
    ['blank pet name', { petName: '   ' }],
    ['malformed email', { ownerEmail: 'not-an-email' }],
    ['unknown service', { service: 'surgery' }],
    ['date without time', { scheduledAt: '2030-05-10' }],
    ['date without offset', { scheduledAt: '2030-05-10T14:00:00' }],
    ['impossible date', { scheduledAt: '2030-02-31T10:00:00Z' }],
    ['oversized pet name', { petName: 'x'.repeat(81) }],
    ['unexpected field', { id: 'forced-id' }],
  ])('rejects %s with 400', async (_label, override) => {
    const attempt = validate(CreateAppointmentDto, {
      ...validPayload,
      ...override,
    });

    await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
    await expect(attempt).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an empty body', async () => {
    await expect(validate(CreateAppointmentDto, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('RescheduleAppointmentDto', () => {
  it('accepts an ISO 8601 timestamp', async () => {
    const result = await validate(RescheduleAppointmentDto, {
      scheduledAt: '2030-05-11T09:30:00Z',
    });

    expect(result.scheduledAt).toBe('2030-05-11T09:30:00Z');
  });

  it('rejects a missing timestamp', async () => {
    await expect(validate(RescheduleAppointmentDto, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
