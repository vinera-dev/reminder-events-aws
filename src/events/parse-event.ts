import { DomainEvent, domainEventSchema } from './contracts.js';

export class InvalidEventError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid event: ${issues.join('; ')}`);
    this.name = 'InvalidEventError';
  }
}

export const parseEvent = (input: unknown): DomainEvent => {
  const result = domainEventSchema.safeParse(input);
  if (!result.success) {
    throw new InvalidEventError(
      result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    );
  }
  return result.data;
};

export const parseEventJson = (raw: string): DomainEvent => {
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    throw new InvalidEventError(['body is not valid JSON']);
  }
  return parseEvent(decoded);
};
