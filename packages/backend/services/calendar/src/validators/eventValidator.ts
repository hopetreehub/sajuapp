import Joi from 'joi'

const eventSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow('').optional(),
  start_datetime: Joi.date().iso().required(),
  end_datetime: Joi.date().iso().min(Joi.ref('start_datetime')).required(),
  is_all_day: Joi.boolean().optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  category: Joi.string().valid(
    'personal', 'work', 'family', 'health', 
    'fortune', 'anniversary', 'holiday', 'other'
  ).optional(),
  location: Joi.string().max(255).allow('').optional(),
  recurrence_rule: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
    interval: Joi.number().integer().min(1).required(),
    endDate: Joi.date().iso().optional(),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
    dayOfMonth: Joi.number().integer().min(1).max(31).optional(),
    count: Joi.number().integer().min(1).optional()
  }).optional(),
  reminders: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('notification', 'email').required(),
      minutesBefore: Joi.number().integer().min(0).required()
    })
  ).optional(),
  attendees: Joi.array().items(Joi.string().email()).optional(),
  diary_linked: Joi.boolean().optional()
})

const partialEventSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  start_datetime: Joi.date().iso().optional(),
  end_datetime: Joi.date().iso().optional(),
  is_all_day: Joi.boolean().optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  category: Joi.string().valid(
    'personal', 'work', 'family', 'health', 
    'fortune', 'anniversary', 'holiday', 'other'
  ).optional(),
  location: Joi.string().max(255).allow('').optional(),
  recurrence_rule: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
    interval: Joi.number().integer().min(1).required(),
    endDate: Joi.date().iso().optional(),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
    dayOfMonth: Joi.number().integer().min(1).max(31).optional(),
    count: Joi.number().integer().min(1).optional()
  }).optional(),
  reminders: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('notification', 'email').required(),
      minutesBefore: Joi.number().integer().min(0).required()
    })
  ).optional(),
  attendees: Joi.array().items(Joi.string().email()).optional(),
  diary_linked: Joi.boolean().optional()
}).min(1) // At least one field must be present for update

export const validateEvent = (data: any, isPartial = false) => {
  const schema = isPartial ? partialEventSchema : eventSchema
  return schema.validate(data, { abortEarly: false })
}