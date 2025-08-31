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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calendar_service_1 = require("./calendar.service");
const calendar_dto_1 = require("./dto/calendar.dto");
const jwt_simple_auth_guard_1 = require("../auth/guards/jwt-simple-auth.guard");
let CalendarController = class CalendarController {
    calendarService;
    constructor(calendarService) {
        this.calendarService = calendarService;
    }
    async create(req, createEventDto) {
        const userId = req.user.userId;
        const event = await this.calendarService.create(userId, createEventDto);
        return {
            success: true,
            data: this.transformEventResponse(event),
            message: 'Event created successfully',
        };
    }
    async findAll(req, query) {
        const userId = req.user.userId;
        const events = await this.calendarService.findAll(userId, query);
        return {
            success: true,
            data: events.map(event => this.transformEventResponse(event)),
            total: events.length,
        };
    }
    async findOne(req, id) {
        const userId = req.user.userId;
        const event = await this.calendarService.findOne(id, userId);
        return {
            success: true,
            data: this.transformEventResponse(event),
        };
    }
    async update(req, id, updateEventDto) {
        const userId = req.user.userId;
        const event = await this.calendarService.update(id, userId, updateEventDto);
        return {
            success: true,
            data: this.transformEventResponse(event),
            message: 'Event updated successfully',
        };
    }
    async remove(req, id) {
        const userId = req.user.userId;
        await this.calendarService.remove(id, userId);
        return {
            success: true,
            message: 'Event deleted successfully',
        };
    }
    transformEventResponse(event) {
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            start_time: event.startTime.toISOString(),
            end_time: event.endTime.toISOString(),
            all_day: event.allDay,
            location: event.location,
            type: event.type,
            color: event.color,
            reminder_minutes: event.reminderMinutes,
            created_at: event.createdAt.toISOString(),
            updated_at: event.updatedAt.toISOString(),
        };
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Post)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new calendar event' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Event created successfully',
        type: calendar_dto_1.EventResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all calendar events for the authenticated user' }),
    (0, swagger_1.ApiQuery)({ name: 'start_date', required: false, description: 'Filter from date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'end_date', required: false, description: 'Filter to date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['personal', 'work', 'holiday', 'other'] }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Events retrieved successfully',
        type: [calendar_dto_1.EventResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_dto_1.EventQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific calendar event' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Event retrieved successfully',
        type: calendar_dto_1.EventResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('events/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a calendar event' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Event updated successfully',
        type: calendar_dto_1.EventResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, calendar_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a calendar event' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Event deleted successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "remove", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('Calendar'),
    (0, common_1.Controller)('calendar'),
    (0, common_1.UseGuards)(jwt_simple_auth_guard_1.JwtSimpleAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map