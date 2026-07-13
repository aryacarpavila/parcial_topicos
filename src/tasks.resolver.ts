import { Resolver, Query } from '@nestjs/graphql';
import { UseInterceptors, Logger } from '@nestjs/common';
import { Task } from './models/task.model';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Resolver for Task-related GraphQL queries and mutations.
 */
@Resolver(() => Task)
@UseInterceptors(LoggingInterceptor)
export class TasksResolver {
  private readonly logger = new Logger(TasksResolver.name);

  @Query(() => [Task], { name: 'helloTasks' })
  getHelloTasks(): Partial<Task>[] {
    this.logger.log('Se ha solicitado la lista básica de tareas desde GraphQL');
    
    return [
      { task_id: '1', title: 'Mi primera tarea guardada en el backend :D' }
    ];
  }
}
