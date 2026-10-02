# reminder-events-aws

An event-driven appointment reminder system on AWS: a NestJS API publishes domain events, and serverless workers deliver reminders reliably.

> **Status:** planned, not started. This README describes the intended scope.

## Purpose

Show how to build and deploy an event-driven, serverless backend with TypeScript: asynchronous messaging, idempotent consumers, failure handling and infrastructure as code. All data is fictional.

## Planned scope

- NestJS REST API that manages appointments and publishes events (created, rescheduled, cancelled)
- SNS and SQS fan-out with dead-letter queues and retry policies
- Lambda workers that schedule and send reminders through a simulated channel
- Idempotent processing so duplicate events never send duplicate reminders
- DynamoDB for reminder state
- Infrastructure defined with Terraform and deployed on the AWS free tier
- Structured logging and basic metrics and alarms

## Planned stack

TypeScript, Node.js, NestJS, AWS (SNS, SQS, Lambda, DynamoDB, CloudWatch), Terraform, Jest, GitHub Actions.

## Roadmap

- [ ] 1. NestJS API skeleton, tests and CI
- [ ] 2. Event contracts and publishing
- [ ] 3. SQS consumers with retries and dead-letter queues
- [ ] 4. Idempotent reminder scheduling and delivery
- [ ] 5. Terraform and deployment
- [ ] 6. Observability and alarms

## License

Released under the [MIT License](LICENSE).
