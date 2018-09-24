import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CBottomSheetComponent } from './c-bottom-sheet.component';

describe('CBottomSheetComponent', () => {
  let component: CBottomSheetComponent;
  let fixture: ComponentFixture<CBottomSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CBottomSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
