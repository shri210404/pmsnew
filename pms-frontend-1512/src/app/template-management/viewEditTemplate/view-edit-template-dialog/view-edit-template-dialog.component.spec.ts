import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditTemplateDialogComponent } from './view-edit-template-dialog.component';

describe('ViewEditTemplateDialogComponent', () => {
  let component: ViewEditTemplateDialogComponent;
  let fixture: ComponentFixture<ViewEditTemplateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditTemplateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
