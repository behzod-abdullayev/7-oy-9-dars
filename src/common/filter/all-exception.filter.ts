import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception.message || "internal server error";

    response.status(status).json({
      statusCode: status,
      message: message || "internal server error",
      error: exception.name || "Unknown error",
      stack: exception.stack || null,
      timeStamp: new Date().toTimeString(),
    });
  }
}