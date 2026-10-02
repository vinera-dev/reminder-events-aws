import { Injectable } from '@nestjs/common';
import { DomainEvent } from './contracts.js';
import { EventPublisher } from './event-publisher.js';
import { parseEvent } from './parse-event.js';

@Injectable()
export class InMemoryEventPublisher extends EventPublisher {
  private readonly events: DomainEvent[] = [];

  publish(event: DomainEvent): Promise<void> {
    try {
      this.events.push(parseEvent(event));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  get published(): readonly DomainEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events.length = 0;
  }
}
