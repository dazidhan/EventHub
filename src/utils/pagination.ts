export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
    sort: Record<string, 1 | -1>;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface RawPaginationQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export function parsePagination(query: RawPaginationQuery): PaginationParams {
    const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
    const limit = Math.min(
        Math.max(Number(query.limit) || DEFAULT_LIMIT, 1),
        MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    return {
        page,
        limit,
        skip,
        sort: { [sortBy]: sortOrder } as Record<string, 1 | -1>,
    };
}

export function buildPaginationMeta(
    total: number,
    page: number,
    limit: number,
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
