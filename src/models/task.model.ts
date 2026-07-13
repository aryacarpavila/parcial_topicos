import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * Task model representing the GraphQL type for a task.
 */
@ObjectType()
export class Task {
  @Field(() => ID, { name: 'id' })
  task_id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  tags?: string[];

  @Field({ nullable: true })
  created_at?: string;

  @Field({ nullable: true })
  assigned_user?: string;

  @Field({ nullable: true })
  project_id?: string;
}
