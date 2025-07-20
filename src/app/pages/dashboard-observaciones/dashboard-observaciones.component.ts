import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

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
    this.http.get<any>(`https://mnematica-backend.onrender.com/api/observaciones/plantilla${params}`)
      .subscribe(data => {
        this.fechas = data.fechas;
        this.estudiantes = data.estudiantes;
      });
  }
}
