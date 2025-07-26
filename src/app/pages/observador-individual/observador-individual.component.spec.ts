import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservadorIndividualComponent } from './observador-individual.component';

describe('ObservadorIndividualComponent', () => {
  let component: ObservadorIndividualComponent;
  let fixture: ComponentFixture<ObservadorIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservadorIndividualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservadorIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
