import { ObjectType, Field, ID } from '@nestjs/graphql';

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

  @Field()
  status!: string;

  @Field(() => [String])
  tags!: string[];

  @Field()
  created_at!: string;

  @Field()
  assigned_user!: string;

  @Field()
  project_id!: string;
}
