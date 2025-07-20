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

  grupos: string[] = ['6°', '7°', '8°', '9°', '10°', '11°'];
  grupoSeleccionado = '6°';
  docenteSeleccionado = '';

  constructor(
    private estudiantesService: EstudiantesService,
    private profesoresService: ProfesoresService,
    private asistenciasService: AsistenciasService
  ) {}

  ngOnInit() {
    // Cargar estado desde localStorage
    const guardado = localStorage.getItem('asistencia');
    if (guardado) {
      const data = JSON.parse(guardado);
      this.grupoSeleccionado = data.grupoSeleccionado || '6°';
      this.docenteSeleccionado = data.docenteSeleccionado || '';
      this.asistenciasMap = data.asistenciasMap || {};
    }

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
    this.guardarEnLocalStorage();
  }

  seleccionarEmoji(nombre: string, emoji: string): void {
    this.asistenciasMap[nombre].emocion = emoji;
    this.guardarEnLocalStorage();
  }

  validarEstado(nombre: string) {
    if (this.asistenciasMap[nombre].estado !== 'presente') {
      this.asistenciasMap[nombre].emocion = '';
    }
    this.guardarEnLocalStorage();
  }

  guardar() {
    const fechaHoy = new Date().toISOString().split('T')[0];
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

  guardarEnLocalStorage() {
    localStorage.setItem('asistencia', JSON.stringify({
      grupoSeleccionado: this.grupoSeleccionado,
      docenteSeleccionado: this.docenteSeleccionado,
      asistenciasMap: this.asistenciasMap
    }));
  }
}
