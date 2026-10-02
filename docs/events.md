# Event contracts

All events share one envelope and are published as JSON. The contract is versioned: `version` only changes when a field is removed or its meaning changes, and consumers must ignore the versions they do not know.

| Field | Type | Meaning |
|---|---|---|
| `id` | UUID | Unique per event; consumers use it to drop duplicates |
| `type` | string | One of the types below |
| `version` | number | Contract version, currently `1` |
| `occurredAt` | ISO 8601 UTC | When the change happened |
| `data` | object | Payload, specific to the type |

All timestamps are UTC with millisecond precision.

## appointment.created

Published when an appointment is booked.

```json
{
  "id": "6f1d3c52-8a0e-4b0f-9d57-2c1f6d9a4e11",
  "type": "appointment.created",
  "version": 1,
  "occurredAt": "2030-05-01T10:00:00.000Z",
  "data": {
    "appointmentId": "0b6a4a0e-52c4-4f2b-bb1b-7a3b3b1e9c01",
    "ownerEmail": "ana@example.com",
    "petName": "Thor",
    "service": "consultation",
    "scheduledAt": "2030-05-10T14:00:00.000Z"
  }
}
```

## appointment.rescheduled

Published when an appointment moves to a new time. It carries the full snapshot plus the time it moved away from.

```json
{
  "id": "9a2c0f64-1d3b-4c8e-8f10-5e7d2b6a3c22",
  "type": "appointment.rescheduled",
  "version": 1,
  "occurredAt": "2030-05-02T09:30:00.000Z",
  "data": {
    "appointmentId": "0b6a4a0e-52c4-4f2b-bb1b-7a3b3b1e9c01",
    "ownerEmail": "ana@example.com",
    "petName": "Thor",
    "service": "consultation",
    "scheduledAt": "2030-05-11T09:00:00.000Z",
    "previousScheduledAt": "2030-05-10T14:00:00.000Z"
  }
}
```

## appointment.cancelled

Published when an appointment is cancelled. It carries only what is needed to invalidate reminders.

```json
{
  "id": "c4e8a7b1-3f5d-4a6c-9b20-8d1e0f2a7b33",
  "type": "appointment.cancelled",
  "version": 1,
  "occurredAt": "2030-05-03T16:45:00.000Z",
  "data": {
    "appointmentId": "0b6a4a0e-52c4-4f2b-bb1b-7a3b3b1e9c01",
    "scheduledAt": "2030-05-11T09:00:00.000Z"
  }
}
```

The TypeScript types live in `src/events/contracts.ts` and the same examples in `src/events/examples.ts`.
