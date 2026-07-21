import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

/**
 * TaskStatus enum representing the current state of a task.
 */
export enum TaskStatus {
  BACKLOG = 'backlog',
  TO_DO = 'to_do',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'The current status of the task',
});

/**
 * Task model representing the GraphQL type for a task.
 */
@ObjectType()
export class Task {
  @Field(() => ID, { name: 'id' })
  task_id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field(() => [String])
  tags!: string[];

  @Field()
  created_at!: string;

  @Field()
  assigned_user!: string;

  @Field()
  project_id!: string;
}
