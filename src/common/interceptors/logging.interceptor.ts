import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor for logging GraphQL request execution times.
 * This demonstrates Aspect-Oriented Programming (AOP).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    
    const contextName = info ? info.fieldName : context.getClass().name;
    const loggerName = context.getClass().name || 'System';
    const logger = new Logger(loggerName);

    logger.log(`Starting execution of ${contextName}...`);
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => logger.log(`Finished execution of ${contextName} in ${Date.now() - now}ms`)),
      );
  }
}
