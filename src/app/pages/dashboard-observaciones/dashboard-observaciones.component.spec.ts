import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardObservacionesComponent } from './dashboard-observaciones.component';

describe('DashboardObservacionesComponent', () => {
  let component: DashboardObservacionesComponent;
  let fixture: ComponentFixture<DashboardObservacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardObservacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardObservacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
