import { DomainEvent } from './contracts.js';

export abstract class EventPublisher {
  abstract publish(event: DomainEvent): Promise<void>;
}
