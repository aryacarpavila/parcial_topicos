import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface TaskPayload {
  id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  created_at: string;
  assigned_user: string;
  project_id: string;
}

interface GraphQLResponse<T> {
  data: T;
  errors?: unknown;
}

describe('Task GraphQL API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('creates, updates, and deletes a task', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation CreateTask($input: CreateTaskInput!) {
            createTask(createTaskInput: $input) {
              id
              title
              description
              status
              tags
              created_at
              assigned_user
              project_id
            }
          }
        `,
        variables: {
          input: {
            title: 'Implement editing',
            description: 'Add the task editing workflow',
            status: 'BACKLOG',
            tags: ['graphql', 'frontend'],
            assigned_user: 'mauricio',
            project_id: 'taller-3',
          },
        },
      })
      .expect(200);

    const createBody = createResponse.body as GraphQLResponse<{
      createTask: TaskPayload;
    }>;
    expect(createBody.errors).toBeUndefined();
    const createdTask = createBody.data.createTask;

    const updateResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation UpdateTask($input: UpdateTaskInput!) {
            updateTask(updateTaskInput: $input) {
              id
              title
              description
              status
              tags
              created_at
              assigned_user
              project_id
            }
          }
        `,
        variables: {
          input: {
            id: createdTask.id,
            title: 'Finish editing',
            description: 'Verify every editable task field',
            status: 'DONE',
            tags: ['graphql', 'tested'],
            assigned_user: 'arya',
            project_id: 'taller-3-final',
          },
        },
      })
      .expect(200);

    const updateBody = updateResponse.body as GraphQLResponse<{
      updateTask: TaskPayload;
    }>;
    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data.updateTask).toEqual({
      id: createdTask.id,
      title: 'Finish editing',
      description: 'Verify every editable task field',
      status: 'DONE',
      tags: ['graphql', 'tested'],
      created_at: createdTask.created_at,
      assigned_user: 'arya',
      project_id: 'taller-3-final',
    });

    const deleteResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation DeleteTask($id: ID!) {
            deleteTask(id: $id) {
              id
              title
            }
          }
        `,
        variables: { id: createdTask.id },
      })
      .expect(200);

    const deleteBody = deleteResponse.body as GraphQLResponse<{
      deleteTask: Pick<TaskPayload, 'id' | 'title'>;
    }>;
    expect(deleteBody.errors).toBeUndefined();
    expect(deleteBody.data.deleteTask).toEqual({
      id: createdTask.id,
      title: 'Finish editing',
    });

    const listResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ tasks { id } }' })
      .expect(200);

    const listBody = listResponse.body as GraphQLResponse<{
      tasks: Array<Pick<TaskPayload, 'id'>>;
    }>;
    expect(listBody.errors).toBeUndefined();
    expect(listBody.data.tasks).toEqual([]);
  });

  it('returns an error when deleting an unknown task', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation DeleteTask($id: ID!) {
            deleteTask(id: $id) { id }
          }
        `,
        variables: { id: 'UNKNOWN' },
      })
      .expect(200);

    const body = response.body as {
      data: null;
      errors: Array<{ message: string }>;
    };
    expect(body.data).toBeNull();
    expect(body.errors[0].message).toContain('Task with id UNKNOWN not found');
  });

  afterEach(async () => {
    await app.close();
  });
});
