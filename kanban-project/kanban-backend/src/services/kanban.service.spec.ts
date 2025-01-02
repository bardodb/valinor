import { Test, TestingModule } from '@nestjs/testing';
import { KanbanService } from './kanban.service';

describe('KanbanService', () => {
  let service: KanbanService;
  const BOARD_ID = '1';

  const initialBoard = {
    id: '1',
    title: 'My Kanban Board',
    lists: [
      {
        id: '1',
        title: 'Backlog',
        order: 0,
        cards: [
          {
            id: '1',
            title: 'Research new features',
            description: 'Analyze competitor products',
            color: '#22272b',
            listId: '1',
            order: 0,
          },
          {
            id: '2',
            title: 'Design mockups',
            description: 'Create UI/UX designs',
            color: '#22272b',
            listId: '1',
            order: 1,
          },
        ],
      },
      {
        id: '2',
        title: 'In Progress',
        order: 1,
        cards: [
          {
            id: '3',
            title: 'Implement authentication',
            description: 'Add user login/signup',
            color: '#22272b',
            listId: '2',
            order: 0,
          },
        ],
      },
      {
        id: '3',
        title: 'Review',
        order: 2,
        cards: [],
      },
      {
        id: '4',
        title: 'Done',
        order: 3,
        cards: [
          {
            id: '4',
            title: 'Setup project',
            description: 'Initialize repository and dependencies',
            color: '#22272b',
            listId: '4',
            order: 0,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanService],
    }).compile();

    service = module.get<KanbanService>(KanbanService);
    // Reset the board state before each test
    service['board'] = JSON.parse(JSON.stringify(initialBoard));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBoard', () => {
    it('should return the initial board state', async () => {
      const board = await service.getBoard(BOARD_ID);
      expect(board).toBeDefined();
      expect(board.id).toBe('1');
      expect(board.title).toBe('My Kanban Board');
      expect(board.lists).toHaveLength(4);
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      const newList = await service.createList({
        title: 'New List',
        order: 4,
      });

      expect(newList).toBeDefined();
      expect(newList.title).toBe('New List');
      expect(newList.order).toBe(4);
      expect(newList.cards).toEqual([]);

      const board = await service.getBoard(BOARD_ID);
      expect(board.lists).toContainEqual(newList);
    });
  });

  describe('createCard', () => {
    it('should create a new card in the specified list', async () => {
      const newCard = await service.createCard({
        title: 'New Card',
        description: 'Test Description',
        color: '#22272b',
        listId: '1',
        order: 2,
      });

      expect(newCard).toBeDefined();
      expect(newCard.title).toBe('New Card');
      expect(newCard.description).toBe('Test Description');
      expect(newCard.listId).toBe('1');
      expect(newCard.order).toBe(2);

      const board = await service.getBoard(BOARD_ID);
      const list = board.lists.find(l => l.id === '1');
      expect(list.cards).toContainEqual(newCard);
    });
  });

  describe('updateCard', () => {
    it('should update an existing card', async () => {
      const updatedCard = await service.updateCard({
        id: '1',
        title: 'Updated Title',
        description: 'Updated Description',
        updateType: 'content'
      });

      expect(updatedCard).toBeDefined();
      expect(updatedCard.title).toBe('Updated Title');
      expect(updatedCard.description).toBe('Updated Description');

      const board = await service.getBoard(BOARD_ID);
      const list = board.lists.find(l => l.id === '1');
      expect(list.cards.find(c => c.id === '1')).toEqual(updatedCard);
    });

    it('should move a card to a different list', async () => {
      const movedCard = await service.updateCard({
        id: '1',
        listId: '2',
        order: 1,
        updateType: 'position'
      });

      expect(movedCard).toBeDefined();
      expect(movedCard.listId).toBe('2');
      expect(movedCard.order).toBe(1);

      const board = await service.getBoard(BOARD_ID);
      const oldList = board.lists.find(l => l.id === '1');
      const newList = board.lists.find(l => l.id === '2');

      expect(oldList.cards.find(c => c.id === '1')).toBeUndefined();
      expect(newList.cards.find(c => c.id === '1')).toEqual(movedCard);
    });
  });
}); 