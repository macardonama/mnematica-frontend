import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';

interface Estudiante {
  _id: string;
  grado: string;
  nombre_estudiante: string;
  fecha_nacimiento: string;
  hito: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, HttpClientModule],
  template: `
    <div class="container inicio-container">
      <h2 class="titulo">Plataforma Escolar</h2>
      <p class="subtitulo">Selecciona el módulo que deseas usar:</p>

      <div class="menu-principal">
        <button class="btn-menu" routerLink="/asistencia">📋 Registrar Asistencia</button>
        <button class="btn-menu" routerLink="/estudiantes">👨‍🏫 Modificar Estudiantes</button>
        <button class="btn-menu" routerLink="/observaciones">📝 Registrar Observaciones</button>
        <button class="btn-menu" routerLink="/dashboard-observaciones">📊 Plantilla de Notas</button>
        <button class="btn-menu" routerLink="/observador-individual">📘 Observador Individual</button>
        <button class="btn-menu" routerLink="/dashboard-asistencia">🗂️ Reporte Asistencias</button>
        <button class="btn-menu" (click)="exportarExcelPorGrupo()">📑 Exportar Estudiantes por Grupo</button>
      </div>
    </div>
  `
})
export class InicioComponent {
  constructor(private http: HttpClient) {}

  exportarExcelPorGrupo() {
    this.http.get<Estudiante[]>('https://mnematica-backend.onrender.com/api/estudiantes').subscribe(estudiantes => {
      // Agrupar estudiantes por grado
      const grupos: { [key: string]: Estudiante[] } = {};
      estudiantes.forEach(est => {
        if (!grupos[est.grado]) {
          grupos[est.grado] = [];
        }
        grupos[est.grado].push(est);
      });

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Crear hoja por cada grupo
      Object.keys(grupos).forEach(grupo => {
        const dataGrupo = grupos[grupo].map((est: Estudiante) => ({
          Nombre: est.nombre_estudiante,
          Fecha_Nacimiento: est.fecha_nacimiento,
          Hito: est.hito
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataGrupo);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Grupo ${grupo}`);
      });

      // Descargar archivo
      XLSX.writeFile(workbook, 'estudiantes_por_grupo.xlsx');
    });
  }
}
