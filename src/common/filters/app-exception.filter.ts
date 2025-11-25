import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const payload = this.buildErrorPayload(exception);
    if (payload.statusCode >= 500) {
      this.logger.error(payload.message, (exception as Error)?.stack);
    }

    response.status(payload.statusCode).json({
      error: {
        code: payload.code,
        message: payload.message,
        details: payload.details ?? {},
      },
    });
  }

  private buildErrorPayload(exception: unknown) {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'error' in response) {
        const err = (
          response as {
            error?: { code: string; message: string; details?: Record<string, unknown> };
          }
        ).error;
        if (err && typeof err === 'object') {
          return {
            statusCode,
            code: err.code,
            message: err.message,
            details: err.details,
          };
        }
      }

      return {
        statusCode,
        code: HttpStatus[statusCode] ?? 'HTTP_ERROR',
        message: typeof response === 'string' ? response : exception.message,
        details: typeof response === 'object' && response !== null ? response : undefined,
      };
    }

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'statusCode' in exception &&
      'code' in exception
    ) {
      const { statusCode, code, message, details } = exception as {
        statusCode: number;
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
      return { statusCode, code, message, details };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
      details: {},
    };
  }
}
