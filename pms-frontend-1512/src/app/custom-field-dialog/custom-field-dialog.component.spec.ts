import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFieldDialogComponent } from './custom-field-dialog.component';

describe('CustomFieldDialogComponent', () => {
  let component: CustomFieldDialogComponent;
  let fixture: ComponentFixture<CustomFieldDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFieldDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFieldDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
