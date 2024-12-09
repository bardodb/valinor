import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Observable, map } from 'rxjs';
import { Board, Card, CreateCardInput, CreateListInput, List, UpdateCardInput, UpdateListInput } from '../types/kanban.types';

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
        refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
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
        refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
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
}
