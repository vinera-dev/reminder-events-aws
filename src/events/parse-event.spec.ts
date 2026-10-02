import {
  cancelledExample,
  createdExample,
  rescheduledExample,
} from './examples.js';
import {
  InvalidEventError,
  parseEvent,
  parseEventJson,
} from './parse-event.js';

const without = (event: object, key: string) => {
  const copy: Record<string, unknown> = { ...event };
  delete copy[key];
  return copy;
};

describe('parseEvent', () => {
  it.each([
    ['created', createdExample],
    ['rescheduled', rescheduledExample],
    ['cancelled', cancelledExample],
  ])('accepts the %s example', (_name, example) => {
    expect(parseEvent(example)).toEqual(example);
  });

  it('accepts a JSON string', () => {
    expect(parseEventJson(JSON.stringify(createdExample))).toEqual(
      createdExample,
    );
  });

  it('ignores unknown extra fields', () => {
    const parsed = parseEvent({ ...createdExample, extra: true });

    expect(parsed).not.toHaveProperty('extra');
  });

  it.each([
    ['not an object', 'text'],
    ['null', null],
    ['unknown type', { ...createdExample, type: 'appointment.deleted' }],
    ['unsupported version', { ...createdExample, version: 2 }],
    ['missing id', without(createdExample, 'id')],
    ['id not a uuid', { ...createdExample, id: '123' }],
    [
      'occurredAt without time',
      { ...createdExample, occurredAt: '2030-05-01' },
    ],
    [
      'occurredAt with offset',
      { ...createdExample, occurredAt: '2030-05-01T10:00:00-03:00' },
    ],
    ['missing data', without(createdExample, 'data')],
    [
      'bad email',
      { ...createdExample, data: { ...createdExample.data, ownerEmail: 'x' } },
    ],
    [
      'unknown service',
      {
        ...createdExample,
        data: { ...createdExample.data, service: 'surgery' },
      },
    ],
    [
      'rescheduled without previous time',
      {
        ...rescheduledExample,
        data: without(rescheduledExample.data, 'previousScheduledAt'),
      },
    ],
    [
      'cancelled without appointment id',
      {
        ...cancelledExample,
        data: { scheduledAt: cancelledExample.data.scheduledAt },
      },
    ],
  ])('rejects %s', (_name, input) => {
    expect(() => parseEvent(input)).toThrow(InvalidEventError);
  });

  it('lists the offending fields', () => {
    expect(() => parseEvent({ ...createdExample, id: '123' })).toThrow(/id: /);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseEventJson('{not json')).toThrow(InvalidEventError);
  });
});
