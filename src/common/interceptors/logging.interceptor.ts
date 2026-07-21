import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Interceptor to log incoming GraphQL requests and their processing time.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercepts the request to add logging before and after the execution.
   * @param context The execution context.
   * @param next The call handler to proceed.
   * @returns An observable of the response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    // Some endpoints like REST might not have info
    const parentType = info ? info.parentType.name : 'Unknown';
    const fieldName = info ? info.fieldName : 'Unknown';
    const action = `${parentType} -> ${fieldName}`;

    this.logger.log(`Request started: ${action}`);

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`Request finished: ${action} - ${Date.now() - now}ms`)),
      );
  }
}
