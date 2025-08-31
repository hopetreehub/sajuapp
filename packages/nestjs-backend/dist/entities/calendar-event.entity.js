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
exports.CalendarEvent = void 0;
const typeorm_1 = require("typeorm");
const user_simple_entity_1 = require("./user-simple.entity");
let CalendarEvent = class CalendarEvent {
    id;
    userId;
    user;
    title;
    description;
    startTime;
    endTime;
    allDay;
    location;
    type;
    color;
    reminderMinutes;
    createdAt;
    updatedAt;
};
exports.CalendarEvent = CalendarEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendarEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CalendarEvent.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_simple_entity_1.UserSimple),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_simple_entity_1.UserSimple)
], CalendarEvent.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CalendarEvent.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { name: 'start_time' }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { name: 'end_time' }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { name: 'all_day', default: false }),
    __metadata("design:type", Boolean)
], CalendarEvent.prototype, "allDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reminder_minutes' }),
    __metadata("design:type", Number)
], CalendarEvent.prototype, "reminderMinutes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "updatedAt", void 0);
exports.CalendarEvent = CalendarEvent = __decorate([
    (0, typeorm_1.Entity)('calendar_events')
], CalendarEvent);
//# sourceMappingURL=calendar-event.entity.js.map