import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Task } from './task.model';
import { Logger } from '@nestjs/common';

@Resolver(() => Task)
export class TasksResolver {
  private readonly logger = new Logger('TasksResolver');

  @Query(() => [Task], { name: 'helloTasks' })
  getHelloTasks(): Task[] {
    this.logger.log('Se ha solicitado la lista básica de tareas desde GraphQL');
    
    return [
      { 
        task_id: '1', 
        title: 'Mi primera tarea guardada en el backend :D',
        description: 'Esto es habladera de paja que despues cambiaremos.',
        status: 'Backlog',
        tags: ['backend', 'nestjs', 'graphql'],
        created_at: new Date().toISOString(),
        assigned_user: 'user_arya',
        project_id: 'parcial_1'
      } as Task
    ];
  }

  @ResolveField(() => String, { name: 'id' })
  resolveId(@Parent() task: Task): string {
    return task.task_id;
  }
}