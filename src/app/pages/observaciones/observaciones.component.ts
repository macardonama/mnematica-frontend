import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from '../../services/estudiantes.service';
import { ProfesoresService } from '../../services/profesores.service';
import { ObservacionesService } from '../../services/observaciones.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './observaciones.component.html',
})
export class ObservacionesComponent implements OnInit {
  grupos: string[] = ['6°', '7°', '8°', '9°', '10°', '11°'];
  grupoSeleccionado = '6°';
  fecha: string = new Date().toISOString().split('T')[0];
  docenteSeleccionado = '';
  observacionGeneral = '';

  estudiantes: any[] = [];
  estudiantesFiltrados: any[] = [];
  docentes: any[] = [];
  observacionesMap: any = {};

  constructor(
    private estudiantesService: EstudiantesService,
    private profesoresService: ProfesoresService,
    private observacionesService: ObservacionesService
  ) {}

  ngOnInit() {
    this.cargarEstudiantes();
    this.cargarDocentes();
    this.cargarDesdeLocalStorage();
  }

  cargarEstudiantes() {
    this.estudiantesService.obtenerEstudiantes().subscribe(data => {
      this.estudiantes = data;
      this.filtrarEstudiantes();
    });
  }

  cargarDocentes() {
    this.profesoresService.obtenerProfesores().subscribe(data => {
      this.docentes = data;
    });
  }

  filtrarEstudiantes() {
    this.estudiantesFiltrados = this.estudiantes.filter(e => e.grado === this.grupoSeleccionado);
    this.estudiantesFiltrados.forEach(e => {
      if (!this.observacionesMap[e.nombre_estudiante]) {
        this.observacionesMap[e.nombre_estudiante] = { observacion: '', nota: null };
      }
    });
    this.guardarEnLocalStorage(); // guarda estructura inicial
  }

  actualizarObservacion(nombre: string, campo: 'observacion' | 'nota', valor: any) {
    if (!this.observacionesMap[nombre]) {
      this.observacionesMap[nombre] = { observacion: '', nota: null };
    }
    this.observacionesMap[nombre][campo] = valor;
    this.guardarEnLocalStorage();
  }

  guardarEnLocalStorage() {
    const key = `observaciones_${this.fecha}_${this.grupoSeleccionado}_${this.docenteSeleccionado}`;
    localStorage.setItem(key, JSON.stringify(this.observacionesMap));
    localStorage.setItem(`${key}_general`, this.observacionGeneral);
  }

  cargarDesdeLocalStorage() {
    const key = `observaciones_${this.fecha}_${this.grupoSeleccionado}_${this.docenteSeleccionado}`;
    const data = localStorage.getItem(key);
    const general = localStorage.getItem(`${key}_general`);
    if (data) {
      this.observacionesMap = JSON.parse(data);
    }
    if (general) {
      this.observacionGeneral = general;
    }
  }

  limpiarLocalStorage() {
    const key = `observaciones_${this.fecha}_${this.grupoSeleccionado}_${this.docenteSeleccionado}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_general`);
  }

  guardar() {
    const observaciones_individuales = this.estudiantesFiltrados
      .map(est => {
        const obs = this.observacionesMap[est.nombre_estudiante];
        return {
          nombre_estudiante: est.nombre_estudiante,
          observacion: obs?.observacion?.trim() || '',
          nota: obs?.nota
        };
      })
      .filter(obs => obs.observacion !== '' || (obs.nota !== null && obs.nota !== undefined && obs.nota.toString().trim() !== ''));

    const payload = {
      grupo: this.grupoSeleccionado,
      fecha: this.fecha,
      docente: this.docenteSeleccionado,
      observacion_general: this.observacionGeneral,
      observaciones_individuales
    };

    if (observaciones_individuales.length === 0 && this.observacionGeneral.trim() === '') {
      alert('No hay datos para guardar.');
      return;
    }

    this.observacionesService.guardarObservacion(payload).subscribe({
      next: () => {
        alert('Observaciones guardadas con éxito.');
        this.limpiarLocalStorage();
      },
      error: err => {
        console.error('Error al guardar observaciones', err);
        alert('Error al guardar observaciones.');
      }
    });
  }
}
