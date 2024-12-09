import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanService } from './services/kanban.service';
import { Card, List, CreateListInput, CreateCardInput, UpdateCardInput, UpdateListInput } from './types/kanban.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('newListInput') newListInput!: ElementRef;
  @ViewChild('newCardInput') newCardInput!: ElementRef;
  @ViewChild('cardTitleInput') cardTitleInput!: ElementRef;

  lists: List[] = [];
  boardTitle = 'My Kanban Board';
  showNewListForm = false;
  newListTitle = '';
  showCardPopup = false;
  showCardDetails = false;
  currentList: List | null = null;
  currentCard: Card | null = null;
  newCardTitle = '';
  editingCardTitle = '';
  editingCardDescription = '';
  popupStyle: { [key: string]: string } = {};

  cardColors = [
    { value: '#4BCE97', name: 'Green' },
    { value: '#F5CD47', name: 'Yellow' },
    { value: '#FEA362', name: 'Orange' },
    { value: '#F87168', name: 'Red' },
    { value: '#9F8FEF', name: 'Purple' },
    { value: '#579DFF', name: 'Blue' },
    { value: '#60C6D2', name: 'Cyan' },
    { value: '#94C748', name: 'Lime' },
    { value: '#E774BB', name: 'Pink' },
    { value: '#8590A2', name: 'Grey' }
  ];

  constructor(private kanbanService: KanbanService) {
    this.loadBoard();
  }

  loadBoard() {
    this.kanbanService.getBoard().subscribe(board => {
      this.lists = board.lists;
    });
  }

  ngAfterViewInit() {
    this.focusNewListInput();
  }

  getTextColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1D2125' : '#FFFFFF';
  }

  focusNewListInput() {
    if (this.showNewListForm && this.newListInput) {
      setTimeout(() => this.newListInput.nativeElement.focus(), 0);
    }
  }

  toggleNewListForm() {
    this.showNewListForm = !this.showNewListForm;
    this.focusNewListInput();
  }

  addNewList() {
    if (this.newListTitle.trim()) {
      const input: CreateListInput = {
        title: this.newListTitle.trim(),
        order: this.lists.length
      };

      this.kanbanService.createList(input).subscribe(() => {
        this.newListTitle = '';
        this.showNewListForm = false;
      });
    }
  }

  openNewCardDialog(event: MouseEvent, list: List) {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    this.popupStyle = {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`
    };
    
    this.currentList = list;
    this.showCardPopup = true;
    this.newCardTitle = '';
    
    setTimeout(() => {
      if (this.newCardInput) {
        this.newCardInput.nativeElement.focus();
      }
    }, 0);
  }

  addNewCard() {
    if (this.currentList && this.newCardTitle.trim()) {
      const input: CreateCardInput = {
        title: this.newCardTitle.trim(),
        description: '',
        color: '#22272b',
        listId: this.currentList.id,
        order: this.currentList.cards.length
      };

      this.kanbanService.createCard(input).subscribe(() => {
        this.closeCardPopup();
      });
    }
  }

  closeCardPopup() {
    this.showCardPopup = false;
    this.currentList = null;
    this.newCardTitle = '';
  }

  openCardDetails(card: Card, list: List) {
    this.currentCard = { ...card };
    this.currentList = list;
    this.editingCardTitle = card.title;
    this.editingCardDescription = card.description;
    this.showCardDetails = true;
  }

  saveCardDetails() {
    if (this.currentCard && this.currentList) {
      const input: UpdateCardInput = {
        id: this.currentCard.id,
        title: this.editingCardTitle.trim(),
        description: this.editingCardDescription.trim(),
        color: this.currentCard.color
      };

      this.kanbanService.updateCard(input).subscribe(() => {
        this.closeCardDetails();
      });
    }
  }

  updateCardColor(color: string) {
    if (this.currentCard) {
      this.currentCard.color = color;
    }
  }

  closeCardDetails() {
    this.showCardDetails = false;
    this.currentCard = null;
    this.currentList = null;
  }

  deleteCard() {
    if (this.currentCard) {
      this.kanbanService.deleteCard(this.currentCard.id).subscribe(() => {
        this.closeCardDetails();
      });
    }
  }

  openListMenu(list: List) {
    const action = prompt('Choose action (edit/delete):');
    if (action === 'edit') {
      const newTitle = prompt('Enter new list title:', list.title);
      if (newTitle && newTitle.trim()) {
        const input: UpdateListInput = {
          id: list.id,
          title: newTitle.trim()
        };
        this.kanbanService.updateList(input).subscribe();
      }
    } else if (action === 'delete') {
      if (confirm('Are you sure you want to delete this list?')) {
        this.kanbanService.deleteList(list.id).subscribe();
      }
    }
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;

      const list = this.lists.find(l => l.cards === event.container.data);
      if (!list) return;

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update orders for all affected cards
      event.container.data.forEach((card, index) => {
        this.kanbanService.updateCard({
          id: card.id,
          order: index
        }).subscribe();
      });
    } else {
      const previousList = this.lists.find(l => l.cards === event.previousContainer.data);
      const newList = this.lists.find(l => l.cards === event.container.data);
      if (!previousList || !newList) return;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the moved card with new list and order
      const movedCard = event.container.data[event.currentIndex];
      this.kanbanService.updateCard({
        id: movedCard.id,
        listId: newList.id,
        order: event.currentIndex
      }).subscribe();

      // Update orders for all affected cards in both lists
      event.previousContainer.data.forEach((card, index) => {
        this.kanbanService.updateCard({
          id: card.id,
          order: index
        }).subscribe();
      });

      event.container.data.forEach((card, index) => {
        if (index !== event.currentIndex) {
          this.kanbanService.updateCard({
            id: card.id,
            order: index
          }).subscribe();
        }
      });
    }
  }

  getConnectedLists() {
    return this.lists.map(list => `list-${list.id}`);
  }
}
