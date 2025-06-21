import { Publisher, PaymentCreatedEvent, Subjects } from '@ticko/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject : Subjects.PaymentCreated = Subjects.PaymentCreated;

    async publish(data: PaymentCreatedEvent['data']): Promise<void> {
        await super.publish(data);
    }
}