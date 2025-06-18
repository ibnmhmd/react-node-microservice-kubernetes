import { Subjects } from "../enum/subjects.enum";

export interface IListenerEvent {
    subject: Subjects;
    data: any;
}