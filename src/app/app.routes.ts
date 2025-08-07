import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AsistenciaComponent } from './pages/asistencia/asistencia.component';
import { EstudiantesComponent } from './pages/estudiantes/estudiantes.component';
import { ObservacionesComponent } from './pages/observaciones/observaciones.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'estudiantes', component: EstudiantesComponent },
  { path: 'observaciones', component: ObservacionesComponent },
  {
  path: 'dashboard-observaciones',
  loadComponent: () => import('./pages/dashboard-observaciones/dashboard-observaciones.component').then(m => m.DashboardObservacionesComponent),
},
{
  path: 'observador-individual',
  loadComponent: () => import('./pages/observador-individual/observador-individual.component')
    .then(m => m.ObservadorIndividualComponent)
},
{
  path: 'dashboard-asistencia',
  loadComponent: () =>
    import('./pages/dashboard-asistencia/dashboard-asistencia.component').then(m => m.DashboardAsistenciaComponent)
}




];
