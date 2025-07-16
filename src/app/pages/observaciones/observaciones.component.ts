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
    next: () => alert('Observaciones guardadas con éxito.'),
    error: err => {
      console.error('Error al guardar observaciones', err);
      alert('Error al guardar observaciones.');
    }
  });
}

}
