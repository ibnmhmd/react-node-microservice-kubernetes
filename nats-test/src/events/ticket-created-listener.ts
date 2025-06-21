import { Message } from "node-nats-streaming";
import Listener from "./base-listener";
import { ITicketCreatedEvent } from "../interface/ticket-created.interface";
import { Subjects } from "../enum/subjects.enum";

export default class TicketCreatedListener extends Listener<ITicketCreatedEvent>{
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: ITicketCreatedEvent['data'], msg: Message) {
    console.log('Ticket created event data:', data);
    // Process the event data as needed
    msg.ack();
  }
}