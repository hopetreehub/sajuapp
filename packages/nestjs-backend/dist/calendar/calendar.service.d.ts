import { Repository } from 'typeorm';
import { CalendarEvent } from '../entities/calendar-event.entity';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/calendar.dto';
export declare class CalendarService {
    private readonly eventRepository;
    constructor(eventRepository: Repository<CalendarEvent>);
    findAll(userId: string, query?: EventQueryDto): Promise<CalendarEvent[]>;
    findOne(id: string, userId: string): Promise<CalendarEvent>;
    create(userId: string, createEventDto: CreateEventDto): Promise<CalendarEvent>;
    update(id: string, userId: string, updateEventDto: UpdateEventDto): Promise<CalendarEvent>;
    remove(id: string, userId: string): Promise<void>;
}
