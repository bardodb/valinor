import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { KanbanService } from './services/kanban.service';
import { ApolloModule } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let kanbanService: jasmine.SpyObj<KanbanService>;
  let mockApollo: jasmine.SpyObj<Apollo>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockBoard = {
    id: '1',
    title: 'My Kanban Board',
    lists: []
  };

  beforeEach(async () => {
    kanbanService = jasmine.createSpyObj('KanbanService', ['getBoardWithUpdates']);
    kanbanService.getBoardWithUpdates.and.returnValue(of(mockBoard));

    mockApollo = jasmine.createSpyObj('Apollo', ['watchQuery']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ApolloModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: KanbanService, useValue: kanbanService },
        { provide: Apollo, useValue: mockApollo },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'My Kanban Board' title`, () => {
    expect(component.boardTitle).toEqual('My Kanban Board');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('My Kanban Board');
  });
});
