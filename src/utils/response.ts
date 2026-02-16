import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface SuccessResponse<T> {
    success: true;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

interface ErrorResponse {
    success: false;
    message: string;
    errorCode?: string;
    errors?: Record<string, string[]>;
    stack?: string;
}

export class ApiResponse {
    static success<T>(
        res: Response,
        data: T,
        message = 'Success',
        statusCode: number = StatusCodes.OK,
    ): Response {
        const body: SuccessResponse<T> = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(body);
    }

    static created<T>(res: Response, data: T, message = 'Created'): Response {
        return ApiResponse.success(res, data, message, StatusCodes.CREATED);
    }

    static paginated<T>(
        res: Response,
        data: T[],
        meta: PaginationMeta,
        message = 'Success',
    ): Response {
        const body: SuccessResponse<T[]> & { meta: PaginationMeta } = {
            success: true,
            message,
            data,
            meta,
        };
        return res.status(StatusCodes.OK).json(body);
    }

    static error(
        res: Response,
        message: string,
        statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
        errorCode?: string,
        errors?: Record<string, string[]>,
    ): Response {
        const body: ErrorResponse = {
            success: false,
            message,
            errorCode,
            errors,
        };
        return res.status(statusCode).json(body);
    }

    static noContent(res: Response): Response {
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}
