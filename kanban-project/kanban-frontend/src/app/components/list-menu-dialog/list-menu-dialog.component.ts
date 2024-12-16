import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { List } from '../../types/kanban.types';

@Component({
  selector: 'app-list-menu-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.list.title }}</h2>
    <mat-dialog-content>
      <div class="dialog-options">
        <button mat-button (click)="onRename()">Rename</button>
        <button mat-button (click)="onExclude()">Exclude</button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .dialog-options button {
      width: 100%;
      text-align: left;
      padding: 12px;
    }
    :host {
      display: block;
      background: #282e33;
      color: #b6c2cf;
    }
    ::ng-deep .mat-mdc-dialog-container {
      --mdc-dialog-container-color: #282e33;
      --mdc-dialog-with-divider-divider-color: rgba(255, 255, 255, 0.12);
    }
    button {
      color: #b6c2cf !important;
    }
    button:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }
  `]
})
export class ListMenuDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ListMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { list: List }
  ) {}

  onRename(): void {
    this.dialogRef.close({ action: 'rename' });
  }

  onExclude(): void {
    this.dialogRef.close({ action: 'exclude' });
  }
}
