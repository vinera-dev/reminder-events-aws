# reminder-events-aws

An event-driven appointment reminder system on AWS: a NestJS API publishes domain events, and serverless workers deliver reminders reliably.

> **Status:** in progress. The REST API for appointments works with an in-memory store; events, consumers and infrastructure are still planned.

## Purpose

Show how to build and deploy an event-driven, serverless backend with TypeScript: asynchronous messaging, idempotent consumers, failure handling and infrastructure as code. All data is fictional.

## Getting started

Requires Node.js 24 or newer.

```bash
npm ci
npm run start:dev
```

The API listens on port 3000 (override with `PORT`).

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/appointments` | Book an appointment |
| PATCH | `/appointments/:id/reschedule` | Move an appointment to a new time |
| POST | `/appointments/:id/cancel` | Cancel an appointment |

```bash
curl -X POST localhost:3000/appointments   -H 'content-type: application/json'   -d '{"ownerName":"Ana Souza","ownerEmail":"ana@example.com","petName":"Thor","service":"consultation","scheduledAt":"2030-05-10T14:00:00Z"}'
```

Past times are rejected with 400 and an already booked time with 409.

Checks used by the CI:

```bash
npm run lint
npm run format:check
npm test
npm run test:e2e
```

Run with Docker:

```bash
docker build -t reminder-events-aws .
docker run --rm -p 3000:3000 reminder-events-aws
```

## Planned scope

- NestJS REST API that manages appointments and publishes events (created, rescheduled, cancelled)
- SNS and SQS fan-out with dead-letter queues and retry policies
- Lambda workers that schedule and send reminders through a simulated channel
- Idempotent processing so duplicate events never send duplicate reminders
- DynamoDB for reminder state
- Infrastructure defined with Terraform and deployed on the AWS free tier
- Structured logging and basic metrics and alarms

## Planned stack

TypeScript, Node.js, NestJS, AWS (SNS, SQS, Lambda, DynamoDB, CloudWatch), Terraform, Vitest, GitHub Actions.

## Roadmap

- [x] 1. NestJS API skeleton, tests and CI
- [ ] 2. Event contracts and publishing
- [ ] 3. SQS consumers with retries and dead-letter queues
- [ ] 4. Idempotent reminder scheduling and delivery
- [ ] 5. Terraform and deployment
- [ ] 6. Observability and alarms

## License

Released under the [MIT License](LICENSE).
