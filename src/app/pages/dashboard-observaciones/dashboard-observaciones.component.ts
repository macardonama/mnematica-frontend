import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Docente {
  nombre_docente: string;
}

@Component({
  selector: 'app-dashboard-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './dashboard-observaciones.component.html',
  styleUrls: ['./dashboard-observaciones.component.css']
})
export class DashboardObservacionesComponent implements OnInit {
  docenteSeleccionado = '';
  grupoSeleccionado = '';
  desde = '';
  hasta = '';

  docentes: Docente[] = [];
  grupos: string[] = ['6°', '7°', '8°', '9°', '10°', '11°'];

  fechas: string[] = [];
  estudiantes: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Docente[]>('https://mnematica-backend.onrender.com/api/profesores')
      .subscribe(data => this.docentes = data);
  }

  cargarDatos() {
  const params = `?docente=${encodeURIComponent(this.docenteSeleccionado)}&grupo=${encodeURIComponent(this.grupoSeleccionado)}&desde=${this.desde}&hasta=${this.hasta}`;

  // Paso 1: obtener las notas
  this.http.get<any>(`https://mnematica-backend.onrender.com/api/observaciones/plantilla${params}`)
    .subscribe(data => {
      this.fechas = data.fechas;
      const notasMap = new Map<string, any>();
      data.estudiantes.forEach((est: any) => {
        notasMap.set(est.nombre, est.notas);
      });

      // Paso 2: obtener TODOS los estudiantes y filtrar en el frontend
      this.http.get<any[]>(`https://mnematica-backend.onrender.com/api/estudiantes`)
        .subscribe(todosEstudiantes => {
          const estudiantesGrupo = todosEstudiantes.filter(est => est.grado === this.grupoSeleccionado);

          // Paso 3: unir ambos
          this.estudiantes = estudiantesGrupo.map(est => ({
            nombre: est.nombre_estudiante,
            notas: notasMap.get(est.nombre_estudiante) || {}
          }));
        });
    });
}

descargarExcel() {
  console.log(this.estudiantes[0]);
  const datos = this.estudiantes.map(est => {
    const fila: any = { Estudiante: est.nombre };
    this.fechas.forEach(fecha => {
      fila[fecha] = est.notas[fecha] || '';
    });
    return fila;
  });

  // 👉 Agregar la fila con el nombre del docente
  const filaDocente: any = { Estudiante: `Docente: ${this.docenteSeleccionado}` };
  this.fechas.forEach(fecha => {
    filaDocente[fecha] = '';
  });

  datos.unshift(filaDocente); // Inserta al inicio del array

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
  const workbook: XLSX.WorkBook = { Sheets: { 'Observaciones': worksheet }, SheetNames: ['Observaciones'] };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `Observaciones_${this.grupoSeleccionado}_${this.desde}_a_${this.hasta}.xlsx`);
}

}

