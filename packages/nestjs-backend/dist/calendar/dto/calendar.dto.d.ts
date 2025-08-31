export declare class CreateEventDto {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    all_day?: boolean;
    location?: string;
    type?: string;
    color?: string;
    reminder_minutes?: number;
}
declare const UpdateEventDto_base: import("@nestjs/common").Type<Partial<CreateEventDto>>;
export declare class UpdateEventDto extends UpdateEventDto_base {
}
export declare class EventQueryDto {
    start_date?: string;
    end_date?: string;
    type?: string;
}
export declare class EventResponseDto {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    location?: string;
    type?: string;
    color?: string;
    reminder_minutes?: number;
    created_at: string;
    updated_at: string;
}
export {};
