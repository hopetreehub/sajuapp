import { UserSimple } from './user-simple.entity';
export declare class CalendarEvent {
    id: string;
    userId: string;
    user: UserSimple;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    allDay: boolean;
    location?: string;
    type?: string;
    color?: string;
    reminderMinutes?: number;
    createdAt: Date;
    updatedAt: Date;
}
