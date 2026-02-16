import { EventRepository } from './event.repository.js';
import type { CreateEventDto, UpdateEventDto, EventFilterDto } from './event.validator.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { FilterQuery } from 'mongoose';
import type { IEventDocument } from './event.model.js';

export class EventService {
    private readonly eventRepo: EventRepository;

    constructor() {
        this.eventRepo = new EventRepository();
    }

    async createEvent(data: CreateEventDto, organizerId: string) {
        const event = await this.eventRepo.create({
            ...data,
            organizer: organizerId,
        });
        return event;
    }

    async getEvents(query: EventFilterDto) {
        const { page, limit, skip, sort } = parsePagination(query);

        const filter: FilterQuery<IEventDocument> = { isPublished: true };

        if (query.category) {
            filter.category = query.category;
        }

        if (query.dateFrom || query.dateTo) {
            filter.date = {};
            if (query.dateFrom) {
                filter.date.$gte = new Date(query.dateFrom);
            }
            if (query.dateTo) {
                filter.date.$lte = new Date(query.dateTo);
            }
        }

        if (query.search) {
            filter.$text = { $search: query.search };
        }

        const [events, total] = await Promise.all([
            this.eventRepo.findWithFilters(filter, skip, limit, sort),
            this.eventRepo.countWithFilters(filter),
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { events, meta };
    }

    async getEventById(id: string) {
        const event = await this.eventRepo.findById(id);
        if (!event) {
            throw new NotFoundError('Event');
        }
        return event;
    }

    async updateEvent(id: string, data: UpdateEventDto, userId: string) {
        const event = await this.eventRepo.findById(id);
        if (!event) {
            throw new NotFoundError('Event');
        }

        if (event.organizer._id.toString() !== userId) {
            throw new ForbiddenError('You can only update your own events');
        }

        return this.eventRepo.update(id, data);
    }

    async deleteEvent(id: string, userId: string) {
        const event = await this.eventRepo.findById(id);
        if (!event) {
            throw new NotFoundError('Event');
        }

        if (event.organizer._id.toString() !== userId) {
            throw new ForbiddenError('You can only delete your own events');
        }

        await this.eventRepo.delete(id);
    }

    async togglePublish(id: string, userId: string, isPublished: boolean) {
        const event = await this.eventRepo.findById(id);
        if (!event) {
            throw new NotFoundError('Event');
        }

        if (event.organizer._id.toString() !== userId) {
            throw new ForbiddenError('You can only publish/unpublish your own events');
        }

        return this.eventRepo.setPublished(id, isPublished);
    }
}
