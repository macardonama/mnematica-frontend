import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAsistenciaComponent } from './dashboard-asistencia.component';

describe('DashboardAsistenciaComponent', () => {
  let component: DashboardAsistenciaComponent;
  let fixture: ComponentFixture<DashboardAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAsistenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
