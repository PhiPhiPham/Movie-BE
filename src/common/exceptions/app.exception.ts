import { HttpException, HttpStatus } from '@nestjs/common';

export class AppHttpException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: number = HttpStatus.BAD_REQUEST,
    details: Record<string, unknown> = {},
  ) {
    super(
      {
        error: {
          code,
          message,
          details,
        },
      },
      status,
    );
  }
}
