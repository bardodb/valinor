import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('KanbanResolver (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Query getBoard', () => {
    it('should return the board with lists and cards', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getBoard {
                id
                title
                lists {
                  id
                  title
                  order
                  cards {
                    id
                    title
                    description
                    color
                    listId
                    order
                  }
                }
              }
            }
          `,
        })
        .expect(200)
        .expect(response => {
          const board = response.body.data.getBoard;
          expect(board).toBeDefined();
          expect(board.id).toBe('1');
          expect(board.title).toBe('My Kanban Board');
          expect(board.lists).toHaveLength(4);
          expect(board.lists[0].cards).toBeDefined();
        });
    });
  });

  describe('Mutation createList', () => {
    it('should create a new list', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createList(createListInput: {
                title: "New Test List"
                order: 4
              }) {
                id
                title
                order
                cards {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect(response => {
          const list = response.body.data.createList;
          expect(list).toBeDefined();
          expect(list.title).toBe('New Test List');
          expect(list.order).toBe(4);
          expect(list.cards).toEqual([]);
        });
    });
  });

  describe('Mutation createCard', () => {
    it('should create a new card', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createCard(createCardInput: {
                title: "New Test Card"
                description: "Test Description"
                color: "#22272b"
                listId: "1"
                order: 2
              }) {
                id
                title
                description
                color
                listId
                order
              }
            }
          `,
        })
        .expect(200)
        .expect(response => {
          const card = response.body.data.createCard;
          expect(card).toBeDefined();
          expect(card.title).toBe('New Test Card');
          expect(card.description).toBe('Test Description');
          expect(card.listId).toBe('1');
          expect(card.order).toBe(2);
        });
    });
  });

  describe('Mutation updateCard', () => {
    it('should update a card', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              updateCard(updateCardInput: {
                id: "1"
                title: "Updated Test Card"
                description: "Updated Description"
                updateType: "content"
              }) {
                id
                title
                description
                listId
                order
              }
            }
          `,
        })
        .expect(200)
        .expect(response => {
          const card = response.body.data.updateCard;
          expect(card).toBeDefined();
          expect(card.id).toBe('1');
          expect(card.title).toBe('Updated Test Card');
          expect(card.description).toBe('Updated Description');
        });
    });

    it('should move a card to a different list', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              updateCard(updateCardInput: {
                id: "1"
                listId: "2"
                order: 1
                updateType: "position"
              }) {
                id
                listId
                order
              }
            }
          `,
        })
        .expect(200)
        .expect(response => {
          const card = response.body.data.updateCard;
          expect(card).toBeDefined();
          expect(card.id).toBe('1');
          expect(card.listId).toBe('2');
          expect(card.order).toBe(1);
        });
    });
  });
}); 