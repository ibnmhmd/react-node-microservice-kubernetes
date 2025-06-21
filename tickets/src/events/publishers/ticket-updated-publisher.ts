
import { Subjects, ITicketCreatedEvent , Publisher, ITicketUpdatedEvent } from "@ticko/common";

class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

    async publish(data: ITicketUpdatedEvent['data']): Promise<void> {
        await super.publish(data);
    }
}
export { TicketUpdatedPublisher };

