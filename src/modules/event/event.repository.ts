import { Event, type IEventDocument } from './event.model.js';
import type { CreateEventDto, UpdateEventDto } from './event.validator.js';
import type { FilterQuery } from 'mongoose';

export class EventRepository {
    async create(
        data: CreateEventDto & { organizer: string },
    ): Promise<IEventDocument> {
        return Event.create(data);
    }

    async findById(id: string): Promise<IEventDocument | null> {
        return Event.findById(id).populate('organizer', 'name email');
    }

    async findWithFilters(
        filter: FilterQuery<IEventDocument>,
        skip: number,
        limit: number,
        sort: Record<string, 1 | -1>,
    ): Promise<IEventDocument[]> {
        return Event.find(filter)
            .populate('organizer', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit);
    }

    async countWithFilters(
        filter: FilterQuery<IEventDocument>,
    ): Promise<number> {
        return Event.countDocuments(filter);
    }

    async update(
        id: string,
        data: UpdateEventDto,
    ): Promise<IEventDocument | null> {
        return Event.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
            .populate('organizer', 'name email');
    }

    async delete(id: string): Promise<IEventDocument | null> {
        return Event.findByIdAndDelete(id);
    }

    async setPublished(
        id: string,
        isPublished: boolean,
    ): Promise<IEventDocument | null> {
        return Event.findByIdAndUpdate(
            id,
            { isPublished },
            { new: true },
        ).populate('organizer', 'name email');
    }
}
