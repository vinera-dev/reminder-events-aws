import { createdExample, rescheduledExample } from './examples.js';
import { InMemoryEventPublisher } from './in-memory-event-publisher.js';
import { InvalidEventError } from './parse-event.js';

describe('InMemoryEventPublisher', () => {
  let publisher: InMemoryEventPublisher;

  beforeEach(() => {
    publisher = new InMemoryEventPublisher();
  });

  it('records published events in order', async () => {
    await publisher.publish(createdExample);
    await publisher.publish(rescheduledExample);

    expect(publisher.published).toEqual([createdExample, rescheduledExample]);
  });

  it('refuses a malformed event and records nothing', async () => {
    const malformed = structuredClone(createdExample);
    Reflect.set(malformed, 'version', 9);

    await expect(publisher.publish(malformed)).rejects.toBeInstanceOf(
      InvalidEventError,
    );
    expect(publisher.published).toEqual([]);
  });

  it('returns a snapshot that later publishes do not change', async () => {
    await publisher.publish(createdExample);
    const snapshot = publisher.published;

    await publisher.publish(rescheduledExample);

    expect(snapshot).toHaveLength(1);
    expect(publisher.published).toHaveLength(2);
  });

  it('can be cleared', async () => {
    await publisher.publish(createdExample);
    publisher.clear();

    expect(publisher.published).toEqual([]);
  });
});
