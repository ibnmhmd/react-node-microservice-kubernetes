import { Subjects } from "../enum/subjects.enum";

export interface IPublisherEvent {
    subject: Subjects;
    data: any;
}