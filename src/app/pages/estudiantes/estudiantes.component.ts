import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from '../../services/estudiantes.service';
import { Estudiante } from '../../models/estudiante.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './estudiantes.component.html',
})
export class EstudiantesComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  nuevoEstudiante: Estudiante = { 
    nombre_estudiante: '', 
    grado: '',
    fecha_nacimiento: '',
    hito: 0
  };

  grupos: string[] = ['Todos', '6°', '7°', '8°', '9°', '10°', '11°'];
  grupoSeleccionado = 'Todos';

  constructor(private estudiantesService: EstudiantesService) {}

  ngOnInit() {
    const localData = localStorage.getItem('estudiantes_data');
    if (localData) {
      const parsed = JSON.parse(localData);
      this.grupoSeleccionado = parsed.grupoSeleccionado || 'Todos';
      this.estudiantes = parsed.estudiantes || [];
    } else {
      this.cargarEstudiantes();
    }
  }

  cargarEstudiantes() {
    this.estudiantesService.obtenerEstudiantes().subscribe(data => {
      this.estudiantes = this.grupoSeleccionado === 'Todos'
        ? data
        : data.filter(e => e.grado === this.grupoSeleccionado);
      this.guardarEnLocalStorage();
    });
  }

  agregar() {
    this.estudiantesService.agregarEstudiante(this.nuevoEstudiante).subscribe(() => {
      this.nuevoEstudiante = { nombre_estudiante: '', grado: '', fecha_nacimiento: '', hito: 0 };
      this.cargarEstudiantes();
    });
  }

  actualizar(estudiante: Estudiante) {
    if (estudiante._id) {
      this.estudiantesService.actualizarEstudiante(estudiante._id, estudiante).subscribe(() => {
        this.cargarEstudiantes();
      });
    }
  }

  eliminar(id: string | undefined) {
    if (id) {
      this.estudiantesService.eliminarEstudiante(id).subscribe(() => {
        this.cargarEstudiantes();
      });
    }
  }

  filtrarPorGrupo() {
    this.cargarEstudiantes();
  }

  guardarEnLocalStorage() {
    localStorage.setItem('estudiantes_data', JSON.stringify({
      grupoSeleccionado: this.grupoSeleccionado,
      estudiantes: this.estudiantes
    }));
  }
}
