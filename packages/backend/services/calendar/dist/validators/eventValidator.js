"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEvent = void 0;
const joi_1 = __importDefault(require("joi"));
const eventSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(255).required(),
    description: joi_1.default.string().max(1000).optional(),
    start_datetime: joi_1.default.date().iso().required(),
    end_datetime: joi_1.default.date().iso().min(joi_1.default.ref('start_datetime')).required(),
    is_all_day: joi_1.default.boolean().optional(),
    color: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    category: joi_1.default.string().valid('personal', 'work', 'family', 'health', 'fortune', 'anniversary', 'holiday', 'other').optional(),
    location: joi_1.default.string().max(255).optional(),
    recurrence_rule: joi_1.default.object({
        frequency: joi_1.default.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
        interval: joi_1.default.number().integer().min(1).required(),
        endDate: joi_1.default.date().iso().optional(),
        daysOfWeek: joi_1.default.array().items(joi_1.default.number().integer().min(0).max(6)).optional(),
        dayOfMonth: joi_1.default.number().integer().min(1).max(31).optional(),
        count: joi_1.default.number().integer().min(1).optional()
    }).optional(),
    reminders: joi_1.default.array().items(joi_1.default.object({
        type: joi_1.default.string().valid('notification', 'email').required(),
        minutesBefore: joi_1.default.number().integer().min(0).required()
    })).optional(),
    attendees: joi_1.default.array().items(joi_1.default.string().email()).optional(),
    diary_linked: joi_1.default.boolean().optional()
});
const partialEventSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(255).optional(),
    description: joi_1.default.string().max(1000).optional(),
    start_datetime: joi_1.default.date().iso().optional(),
    end_datetime: joi_1.default.date().iso().optional(),
    is_all_day: joi_1.default.boolean().optional(),
    color: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    category: joi_1.default.string().valid('personal', 'work', 'family', 'health', 'fortune', 'anniversary', 'holiday', 'other').optional(),
    location: joi_1.default.string().max(255).optional(),
    recurrence_rule: joi_1.default.object({
        frequency: joi_1.default.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
        interval: joi_1.default.number().integer().min(1).required(),
        endDate: joi_1.default.date().iso().optional(),
        daysOfWeek: joi_1.default.array().items(joi_1.default.number().integer().min(0).max(6)).optional(),
        dayOfMonth: joi_1.default.number().integer().min(1).max(31).optional(),
        count: joi_1.default.number().integer().min(1).optional()
    }).optional(),
    reminders: joi_1.default.array().items(joi_1.default.object({
        type: joi_1.default.string().valid('notification', 'email').required(),
        minutesBefore: joi_1.default.number().integer().min(0).required()
    })).optional(),
    attendees: joi_1.default.array().items(joi_1.default.string().email()).optional(),
    diary_linked: joi_1.default.boolean().optional()
}).min(1); // At least one field must be present for update
const validateEvent = (data, isPartial = false) => {
    const schema = isPartial ? partialEventSchema : eventSchema;
    return schema.validate(data, { abortEarly: false });
};
exports.validateEvent = validateEvent;
//# sourceMappingURL=eventValidator.js.map