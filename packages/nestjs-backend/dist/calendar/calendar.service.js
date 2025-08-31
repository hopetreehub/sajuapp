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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const calendar_event_entity_1 = require("../entities/calendar-event.entity");
let CalendarService = class CalendarService {
    eventRepository;
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async findAll(userId, query = {}) {
        const queryBuilder = this.eventRepository
            .createQueryBuilder('event')
            .where('event.userId = :userId', { userId })
            .orderBy('event.startTime', 'ASC');
        if (query.start_date) {
            queryBuilder.andWhere('event.startTime >= :start_date', {
                start_date: new Date(query.start_date)
            });
        }
        if (query.end_date) {
            queryBuilder.andWhere('event.endTime <= :end_date', {
                end_date: new Date(query.end_date)
            });
        }
        if (query.type) {
            queryBuilder.andWhere('event.type = :type', { type: query.type });
        }
        return await queryBuilder.getMany();
    }
    async findOne(id, userId) {
        const event = await this.eventRepository.findOne({
            where: { id, userId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async create(userId, createEventDto) {
        const event = this.eventRepository.create({
            ...createEventDto,
            userId,
            startTime: new Date(createEventDto.start_time),
            endTime: new Date(createEventDto.end_time),
            allDay: createEventDto.all_day,
            reminderMinutes: createEventDto.reminder_minutes,
        });
        return await this.eventRepository.save(event);
    }
    async update(id, userId, updateEventDto) {
        const event = await this.findOne(id, userId);
        const updateData = {
            ...updateEventDto,
        };
        if (updateEventDto.start_time) {
            updateData.startTime = new Date(updateEventDto.start_time);
        }
        if (updateEventDto.end_time) {
            updateData.endTime = new Date(updateEventDto.end_time);
        }
        if (updateEventDto.all_day !== undefined) {
            updateData.allDay = updateEventDto.all_day;
        }
        if (updateEventDto.reminder_minutes !== undefined) {
            updateData.reminderMinutes = updateEventDto.reminder_minutes;
        }
        Object.assign(event, updateData);
        return await this.eventRepository.save(event);
    }
    async remove(id, userId) {
        const event = await this.findOne(id, userId);
        await this.eventRepository.remove(event);
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(calendar_event_entity_1.CalendarEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map