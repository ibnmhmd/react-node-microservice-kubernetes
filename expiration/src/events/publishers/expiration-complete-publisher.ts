import { ExpirationCompleteEvent, Publisher, Subjects } from "@ticko/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    async publish(data: { orderId: string; }): Promise<void>{
        await super.publish(data);
    }
}