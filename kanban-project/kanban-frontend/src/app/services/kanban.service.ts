import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Observable, map, merge } from 'rxjs';
import { Board, Card, CreateCardInput, CreateListInput, List, UpdateCardInput, UpdateListInput, BulkUpdateCardsInput, BulkUpdateListsInput, BulkUpdateInput } from '../types/kanban.types';

// GraphQL Queries and Mutations
const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
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
`;

const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
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
`;

const UPDATE_LIST = gql`
  mutation UpdateList($input: UpdateListInput!) {
    updateList(input: $input) {
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
`;

const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id)
  }
`;

const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      id
      title
      description
      color
      listId
      order
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($input: UpdateCardInput!) {
    updateCard(input: $input) {
      id
      title
      description
      color
      listId
      order
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id)
  }
`;

const BULK_UPDATE_CARDS = gql`
  mutation BulkUpdateCards($input: BulkUpdateCardsInput!) {
    bulkUpdateCards(input: $input) {
      id
      listId
      order
    }
  }
`;

const BULK_UPDATE_LISTS = gql`
  mutation BulkUpdateLists($input: BulkUpdateListsInput!) {
    bulkUpdateLists(input: $input) {
      id
      order
    }
  }
`;

const BULK_UPDATE = gql`
  mutation BulkUpdate($input: BulkUpdateInput!) {
    bulkUpdate(input: $input) {
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
`;

const BOARD_UPDATED = gql`
  subscription OnBoardUpdated($boardId: ID!) {
    boardUpdated(boardId: $boardId) {
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
`;

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private boardId = '1'; // Default board ID

  constructor(private apollo: Apollo) {}

  getBoard(): Observable<Board> {
    return this.apollo
      .watchQuery<{ board: Board }>({
        query: GET_BOARD,
        variables: { id: this.boardId }
      })
      .valueChanges.pipe(map(result => result.data.board));
  }

  createList(input: CreateListInput): Observable<List> {
    return this.apollo
      .mutate<{ createList: List }>({
        mutation: CREATE_LIST,
        variables: { input },
        refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
      })
      .pipe(map(result => result.data!.createList));
  }

  updateList(input: UpdateListInput): Observable<List> {
    return this.apollo
      .mutate<{ updateList: List }>({
        mutation: UPDATE_LIST,
        variables: { input },
        optimisticResponse: {
          updateList: {
            __typename: 'List',
            id: input.id,
            title: input.title || '',
            order: input.order || 0,
            cards: [] // Will be populated from cache
          }
        },
        update: (cache, { data }) => {
          if (!data) return;

          const existingBoard = cache.readQuery<{ board: Board }>({
            query: GET_BOARD,
            variables: { id: this.boardId }
          });

          if (!existingBoard) return;

          const updatedBoard = {
            ...existingBoard.board,
            lists: existingBoard.board.lists.map(list =>
              list.id === data.updateList.id ? data.updateList : list
            )
          };

          cache.writeQuery({
            query: GET_BOARD,
            variables: { id: this.boardId },
            data: { board: updatedBoard }
          });
        }
      })
      .pipe(map(result => result.data!.updateList));
  }

  deleteList(id: string): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteList: boolean }>({
        mutation: DELETE_LIST,
        variables: { id },
        refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
      })
      .pipe(map(result => result.data!.deleteList));
  }

  createCard(input: CreateCardInput): Observable<Card> {
    return this.apollo
      .mutate<{ createCard: Card }>({
        mutation: CREATE_CARD,
        variables: { input },
        refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
      })
      .pipe(map(result => result.data!.createCard));
  }

  updateCard(input: UpdateCardInput): Observable<Card> {
    return this.apollo
      .mutate<{ updateCard: Card }>({
        mutation: UPDATE_CARD,
        variables: { input },
        optimisticResponse: {
          updateCard: {
            __typename: 'Card',
            id: input.id,
            title: input.title || '',
            description: input.description || '',
            color: input.color || '',
            listId: input.listId || '',
            order: input.order || 0,
          }
        },
        update: (cache, { data }) => {
          if (!data) return;
          
          // Read the current board data
          const existingBoard = cache.readQuery<{ board: Board }>({
            query: GET_BOARD,
            variables: { id: this.boardId }
          });

          if (!existingBoard) return;

          // Update the card in the cache
          const updatedBoard = {
            ...existingBoard.board,
            lists: existingBoard.board.lists.map(list => ({
              ...list,
              cards: list.cards.map(card => 
                card.id === data.updateCard.id ? data.updateCard : card
              )
            }))
          };

          // Write back to cache
          cache.writeQuery({
            query: GET_BOARD,
            variables: { id: this.boardId },
            data: { board: updatedBoard }
          });
        }
      })
      .pipe(map(result => result.data!.updateCard));
  }

  deleteCard(id: string): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteCard: boolean }>({
        mutation: DELETE_CARD,
        variables: { id },
        refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
      })
      .pipe(map(result => result.data!.deleteCard));
  }

  bulkUpdateCards(input: BulkUpdateCardsInput): Observable<Card[]> {
    return this.apollo
      .mutate<{ bulkUpdateCards: Card[] }>({
        mutation: BULK_UPDATE_CARDS,
        variables: { input },
        optimisticResponse: {
          bulkUpdateCards: input.cards.map(card => ({
            __typename: 'Card',
            id: card.id,
            title: '',           // Providing default empty string
            description: '',     // Providing default empty string
            color: '#FFFFFF',    // Providing default white color
            listId: card.listId || '',
            order: card.order
          }))
        },
        update: (cache, { data }) => {
          if (!data) return;
          
          const existingBoard = cache.readQuery<{ board: Board }>({
            query: GET_BOARD,
            variables: { id: this.boardId }
          });

          if (!existingBoard) return;

          // Update multiple cards in the cache
          const updatedBoard = {
            ...existingBoard.board,
            lists: existingBoard.board.lists.map(list => ({
              ...list,
              cards: list.cards.map(card => {
                const updatedCard = data.bulkUpdateCards.find(uc => uc.id === card.id);
                return updatedCard ? { ...card, ...updatedCard } : card;
              })
            }))
          };

          cache.writeQuery({
            query: GET_BOARD,
            variables: { id: this.boardId },
            data: { board: updatedBoard }
          });
        }
      })
      .pipe(map(result => result.data!.bulkUpdateCards));
  }

  bulkUpdateLists(input: BulkUpdateListsInput): Observable<List[]> {
    return this.apollo.mutate<{ bulkUpdateLists: List[] }>({
      mutation: BULK_UPDATE_LISTS,
      variables: { input },
      update: (cache, { data }) => {
        const board = cache.readQuery<{ board: Board }>({
          query: GET_BOARD,
          variables: { id: this.boardId }
        });

        if (board) {
          const updatedLists = board.board.lists.map(list => {
            const updatedList = input.lists.find(l => l.id === list.id);
            if (updatedList) {
              return {
                ...list,
                order: updatedList.order
              };
            }
            return list;
          });

          cache.writeQuery({
            query: GET_BOARD,
            variables: { id: this.boardId },
            data: {
              board: {
                ...board.board,
                lists: updatedLists
              }
            }
          });
        }
      }
    }).pipe(map(result => result.data?.bulkUpdateLists || []));
  }

  bulkUpdate(input: { lists: List[], cards: Card[] }): Observable<{ lists: List[], cards: Card[] }> {
    return this.apollo
      .mutate<{ bulkUpdate: { lists: List[], cards: Card[] } }>({
        mutation: BULK_UPDATE,
        variables: { input },
        update: (cache, { data }) => {
          if (!data) return;
          
          // Update the cache with the new data
          const boardData = cache.readQuery<{ board: Board }>({
            query: GET_BOARD,
            variables: { id: this.boardId }
          });

          if (boardData) {
            cache.writeQuery({
              query: GET_BOARD,
              variables: { id: this.boardId },
              data: {
                board: {
                  ...boardData.board,
                  lists: data.bulkUpdate.lists
                }
              }
            });
          }
        }
      })
      .pipe(map(result => result.data!.bulkUpdate));
  }

  // Subscribe to real-time board updates
  subscribeToBoard(): Observable<Board> {
    return this.apollo
      .subscribe<{ boardUpdated: Board }>({
        query: BOARD_UPDATED,
        variables: { boardId: this.boardId }
      })
      .pipe(map(result => {
        if (!result.data) {
          throw new Error('No data received from subscription');
        }
        return result.data.boardUpdated;
      }));
  }

  // Enhanced getBoard method that uses polling for updates
  getBoardWithUpdates(): Observable<Board> {
    return this.apollo.watchQuery<{ board: Board }>({
      query: GET_BOARD,
      variables: { id: this.boardId },
      pollInterval: 2000, // Poll every 2 seconds
    }).valueChanges.pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No data received from query');
        }
        return result.data.board;
      })
    );
  }
}
