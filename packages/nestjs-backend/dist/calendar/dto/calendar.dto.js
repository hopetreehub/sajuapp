"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventResponseDto = exports.EventQueryDto = exports.UpdateEventDto = exports.CreateEventDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEventDto {
    title;
    description;
    start_time;
    end_time;
    all_day;
    location;
    type;
    color;
    reminder_minutes;
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Event description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event start time (ISO string)', example: '2024-01-01T09:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event end time (ISO string)', example: '2024-01-01T10:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "end_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is all-day event', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEventDto.prototype, "all_day", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Event location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Event type',
        enum: ['personal', 'work', 'holiday', 'other'],
        default: 'personal'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['personal', 'work', 'holiday', 'other']),
    __metadata("design:type", String)
], CreateEventDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Event color (hex)', example: '#FF5733' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reminder minutes before event', example: 15 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "reminder_minutes", void 0);
class UpdateEventDto extends (0, swagger_1.PartialType)(CreateEventDto) {
}
exports.UpdateEventDto = UpdateEventDto;
class EventQueryDto {
    start_date;
    end_date;
    type;
}
exports.EventQueryDto = EventQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter events from this date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EventQueryDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter events until this date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EventQueryDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by event type',
        enum: ['personal', 'work', 'holiday', 'other']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['personal', 'work', 'holiday', 'other']),
    __metadata("design:type", String)
], EventQueryDto.prototype, "type", void 0);
class EventResponseDto {
    id;
    title;
    description;
    start_time;
    end_time;
    all_day;
    location;
    type;
    color;
    reminder_minutes;
    created_at;
    updated_at;
}
exports.EventResponseDto = EventResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event start time (ISO string)' }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event end time (ISO string)' }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "end_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is all-day event' }),
    __metadata("design:type", Boolean)
], EventResponseDto.prototype, "all_day", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], EventResponseDto.prototype, "reminder_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "updated_at", void 0);
//# sourceMappingURL=calendar.dto.js.map