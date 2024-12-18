import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { KanbanService } from './services/kanban.service';
import { Card, List, CreateListInput, CreateCardInput, UpdateCardInput, UpdateListInput, Board } from './types/kanban.types';
import { ListMenuDialogComponent } from './components/list-menu-dialog/list-menu-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    ListMenuDialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild('newListInput') newListInput!: ElementRef;
  @ViewChild('newCardInput') newCardInput!: ElementRef;
  @ViewChild('cardTitleInput') cardTitleInput!: ElementRef;

  lists: List[] = [];
  board!: Board;
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

  constructor(
    private kanbanService: KanbanService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // Subscribe to board updates
    this.kanbanService.getBoardWithUpdates().subscribe(board => {
      this.board = board;
      this.lists = board.lists;
      this.lists.sort((a, b) => a.order - b.order);
      this.lists.forEach(list => {
        list.cards.sort((a, b) => a.order - b.order);
      });
    });
  }

  ngAfterViewInit() {
    this.focusNewListInput();
  }

  getTextColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 2), 16);
    const b = parseInt(hex.substring(4, 2), 16);
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
    if (!this.currentCard) return;

    const updates: UpdateCardInput = {
      id: this.currentCard.id,
      title: this.editingCardTitle,
      description: this.editingCardDescription,
      color: this.currentCard.color
    };

    // Update local state immediately
    Object.assign(this.currentCard, updates);
    
    // Update in backend
    this.kanbanService.updateCard(updates)
      .subscribe({
        next: () => this.closeCardDetails(),
        error: (error) => {
          console.error('Failed to update card:', error);
          // Optionally show error message to user
        }
      });
  }

  updateCardColor(color: string) {
    if (!this.currentCard) return;
    
    // Update local state immediately
    this.currentCard.color = color;
    
    // Update in backend
    this.kanbanService.updateCard({
      id: this.currentCard.id,
      color: color
    }).subscribe();
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
    const dialogRef = this.dialog.open(ListMenuDialogComponent, {
      width: '250px',
      data: { list }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'rename') {
        const newTitle = prompt('Enter new list title:', list.title);
        if (newTitle && newTitle.trim()) {
          const input: UpdateListInput = {
            id: list.id,
            title: newTitle.trim()
          };
          this.kanbanService.updateList(input).subscribe();
        }
      } else if (result?.action === 'exclude') {
        if (confirm('Are you sure you want to delete this list?')) {
          this.kanbanService.deleteList(list.id).subscribe();
        }
      }
    });
  }

  dropCard(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;

      const list = this.lists.find(l => l.cards === event.container.data);
      if (!list) return;

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update all cards in the list with a single request
      const cards = event.container.data.map((card, index) => ({
        id: card.id,
        order: index
      }));
      
      this.kanbanService.bulkUpdateCards({ cards }).subscribe();
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

      // Update all affected cards in both lists with a single request
      const cards = [
        ...event.previousContainer.data.map((card, index) => ({
          id: card.id,
          order: index
        })),
        ...event.container.data.map((card, index) => ({
          id: card.id,
          order: index,
          listId: newList.id
        }))
      ];

      this.kanbanService.bulkUpdateCards({ cards }).subscribe();
    }
  }

  dropList(event: CdkDragDrop<List[]>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.lists, event.previousIndex, event.currentIndex);

    // Update all lists with their new orders in a single request
    const lists = this.lists.map((list, index) => ({
      id: list.id,
      order: index
    }));

    this.kanbanService.bulkUpdateLists({ lists }).subscribe();
  }

  getConnectedLists() {
    return this.lists.map(list => `list-${list.id}`);
  }
}
