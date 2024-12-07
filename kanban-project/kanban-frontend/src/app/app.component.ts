import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Card {
  id?: number;
  title: string;
  description: string;
  listId: string;
  color: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
  position: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent {
  title = 'Kanban Board';
  lists: List[] = [
    { id: 'backlog', title: 'Backlog', cards: [], position: 0 },
    { id: 'todo', title: 'A Fazer', cards: [], position: 1 },
    { id: 'doing', title: 'Em andamento', cards: [], position: 2 },
    { id: 'design', title: 'Design', cards: [], position: 3 }
  ];

  activeList: string | null = null;
  showNewListForm = false;
  showCardModal = false;
  showListMenu: string | null = null;
  editingListId: string | null = null;
  editingListTitle = '';
  newListTitle = '';
  
  cardColors = [
    { value: '#4CAF50', name: 'Green' },
    { value: '#FFA000', name: 'Orange' },
    { value: '#F57C00', name: 'Deep Orange' },
    { value: '#F44336', name: 'Red' },
    { value: '#673AB7', name: 'Purple' },
    { value: '#2196F3', name: 'Blue' },
    { value: '#00BCD4', name: 'Cyan' },
    { value: '#4CAF50', name: 'Light Green' },
    { value: '#9C27B0', name: 'Pink' },
    { value: '#607D8B', name: 'Grey' }
  ];
  
  newCardData: Card = {
    title: '',
    description: '',
    listId: '',
    color: '#2196F3'
  };

  editingCardId: number | null = null;
  showEditCardModal = false;
  editingCard: Card | null = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if click is outside menu
    if (!this.isClickInsideMenu(event)) {
      this.showListMenu = null;
    }
  }

  private isClickInsideMenu(event: MouseEvent): boolean {
    const element = event.target as HTMLElement;
    return element.closest('.list-menu') !== null;
  }

  toggleListMenu(listId: string | null) {
    this.showListMenu = this.showListMenu === listId ? null : listId;
  }

  startEditingList(list: List) {
    this.editingListId = list.id;
    this.editingListTitle = list.title;
    this.showListMenu = null;
  }

  saveListEdit() {
    if (this.editingListId && this.editingListTitle.trim()) {
      const list = this.lists.find(l => l.id === this.editingListId);
      if (list) {
        list.title = this.editingListTitle.trim();
        this.editingListId = null;
        this.editingListTitle = '';
      }
    }
  }

  cancelListEdit() {
    this.editingListId = null;
    this.editingListTitle = '';
  }

  deleteList(listId: string) {
    const index = this.lists.findIndex(l => l.id === listId);
    if (index !== -1) {
      this.lists.splice(index, 1);
      // Update positions after deletion
      this.lists.forEach((list, idx) => {
        list.position = idx;
      });
    }
    this.showListMenu = null;
  }

  toggleAddCard(listId: string) {
    this.showCardModal = true;
    this.newCardData = {
      title: '',
      description: '',
      listId: listId,
      color: '#2196F3'
    };
  }

  addCard() {
    if (this.newCardData.title.trim()) {
      const list = this.lists.find(l => l.id === this.newCardData.listId);
      if (list) {
        // Add an ID to the new card
        const newCard = {
          ...this.newCardData,
          id: Date.now() // Simple way to generate unique IDs
        };
        list.cards.push(newCard);
        this.closeCardModal();
      }
    }
  }

  closeCardModal() {
    this.showCardModal = false;
    this.newCardData = {
      title: '',
      description: '',
      listId: '',
      color: '#2196F3'
    };
  }

  toggleNewListForm() {
    this.showNewListForm = !this.showNewListForm;
    this.newListTitle = '';
  }

  addNewList() {
    if (this.newListTitle.trim()) {
      const newList: List = {
        id: this.newListTitle.toLowerCase().replace(/\s+/g, '-'),
        title: this.newListTitle,
        cards: [],
        position: this.lists.length
      };
      this.lists.push(newList);
      this.showNewListForm = false;
      this.newListTitle = '';
    }
  }

  editCard(card: Card) {
    this.editingCard = { ...card };
    this.showEditCardModal = true;
  }

  saveCardEdit() {
    if (this.editingCard) {
      const list = this.lists.find(l => l.id === this.editingCard!.listId);
      if (list) {
        const cardIndex = list.cards.findIndex(c => c.id === this.editingCard!.id);
        if (cardIndex !== -1) {
          list.cards[cardIndex] = { ...this.editingCard };
        }
      }
      this.closeEditCardModal();
    }
  }

  closeEditCardModal() {
    this.showEditCardModal = false;
    this.editingCard = null;
  }

  deleteCard(listId: string, cardId: number) {
    const list = this.lists.find(l => l.id === listId);
    if (list) {
      const cardIndex = list.cards.findIndex(c => c.id === cardId);
      if (cardIndex !== -1) {
        list.cards.splice(cardIndex, 1);
      }
    }
  }
}
