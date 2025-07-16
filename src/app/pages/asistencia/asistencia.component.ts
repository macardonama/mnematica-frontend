import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from '../../services/estudiantes.service';
import { ProfesoresService } from '../../services/profesores.service';
import { AsistenciasService } from '../../services/asistencia.service';
import { Estudiante } from '../../models/estudiante.model';
import { RegistroAsistencia } from '../../models/asistencia.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './asistencia.component.html',
})
export class AsistenciaComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  estudiantesFiltrados: Estudiante[] = [];
  docentes: any[] = [];
  asistenciasMap: any = {};
  emojis: string[] = ['😃', '😐', '😔', '😡', '🥱', '😊', '🤢', '🥰', '🤯'];
  seleccionarEmoji(nombre: string, emoji: string): void {
  this.asistenciasMap[nombre].emocion = emoji;
}

  grupos: string[] = ['6°', '7°', '8°', '9°', '10°', '11°'];
  grupoSeleccionado = '6°';
  docenteSeleccionado = '';

  constructor(
    private estudiantesService: EstudiantesService,
    private profesoresService: ProfesoresService,
    private asistenciasService: AsistenciasService
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
      if (!this.asistenciasMap[e.nombre_estudiante]) {
        this.asistenciasMap[e.nombre_estudiante] = { estado: '', emocion: '' };
      }
    });
  }

  validarEstado(nombre: string) {
    if (this.asistenciasMap[nombre].estado !== 'presente') {
      this.asistenciasMap[nombre].emocion = '';
    }
  }

  guardar() {
    const fechaHoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const asistencias = this.estudiantesFiltrados.map(e => {
      const estado = this.asistenciasMap[e.nombre_estudiante].estado;
      const emocion = this.asistenciasMap[e.nombre_estudiante].emocion;
      const registro: any = {
        nombre_estudiante: e.nombre_estudiante,
        estado: estado,
      };
      if (estado === 'presente') {
        registro.emocion = emocion;
      }
      return registro;
    });

    const payload: RegistroAsistencia = {
      docente: this.docenteSeleccionado,
      grupo: this.grupoSeleccionado,
      fecha: fechaHoy,
      asistencias: asistencias,
    };

    this.asistenciasService.guardarAsistencia(payload).subscribe(() => {
      alert('Asistencia guardada con éxito.');
    });
  }
}
