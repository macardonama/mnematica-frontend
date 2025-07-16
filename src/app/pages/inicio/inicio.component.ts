import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container inicio-container">
  <h2 class="titulo">Plataforma Escolar</h2>
  

  <p class="subtitulo">Selecciona el módulo que deseas usar:</p>

  <div class="menu-principal">
    <button class="btn-menu" routerLink="/asistencia">📋 Registrar Asistencia</button>
    <button class="btn-menu" routerLink="/estudiantes">👨‍🏫 Modificar Estudiantes</button>
    <button class="btn-menu" routerLink="/observaciones">📝 Registrar Observaciones</button>
  </div>
</div>

  `
})
export class InicioComponent {}
