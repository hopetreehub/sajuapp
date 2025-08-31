import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto, EventResponseDto } from './dto/calendar.dto';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    create(req: any, createEventDto: CreateEventDto): Promise<{
        success: boolean;
        data: EventResponseDto;
        message: string;
    }>;
    findAll(req: any, query: EventQueryDto): Promise<{
        success: boolean;
        data: EventResponseDto[];
        total: number;
    }>;
    findOne(req: any, id: string): Promise<{
        success: boolean;
        data: EventResponseDto;
    }>;
    update(req: any, id: string, updateEventDto: UpdateEventDto): Promise<{
        success: boolean;
        data: EventResponseDto;
        message: string;
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private transformEventResponse;
}
