import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-observador-individual',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observador-individual.component.html',
  styleUrl: './observador-individual.component.css'
})
export class ObservadorIndividualComponent {
  grupos: string[] = ['6°', '7°', '8°', '9°', '10°', '11°'];
  grupoSeleccionado: string = '';
  estudiantesFiltrados: string[] = [];
  estudianteSeleccionado: string = '';
  estudianteEscrito: string = '';
  estudiantesTodos: any[] = [];


  constructor(private http: HttpClient) {}

getFechaDesdeObjectId(objectId: string): string {
  const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
  const fecha = new Date(timestamp);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${mes}/${dia}/${anio}`;
}



 cargarEstudiantes() {
  if (!this.grupoSeleccionado) return;

  this.http.get<any[]>(`https://mnematica-backend.onrender.com/api/estudiantes`)
    .subscribe(data => {
      this.estudiantesTodos = data;
      this.estudiantesFiltrados = data
        .filter(est => est.grado === this.grupoSeleccionado)
        .map(est => est.nombre_estudiante)
        .sort();
    });
}


  generarPDF() {
  const nombreEstudiante = this.estudianteEscrito || this.estudianteSeleccionado;
  if (!nombreEstudiante) {
    alert('Selecciona o escribe el nombre del estudiante');
    return;
  }

  const nombre = encodeURIComponent(nombreEstudiante);
  this.http.get<any[]>(`https://mnematica-backend.onrender.com/api/observaciones/estudiante/${nombre}`)
    .subscribe(data => {
      const observacionesFiltradas = this.filtrarUnaPorDocenteYFecha(data);
      observacionesFiltradas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      const grado = observacionesFiltradas[0]?.grupo || 'Sin grado';
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Observador individual: ${nombreEstudiante} - ${grado}`, 14, 20);

      // 🔍 Buscar estudiante en la lista general
      const estudianteData = this.estudiantesTodos.find(est => est.nombre_estudiante === nombreEstudiante);
      const fechaCreacion = estudianteData ? this.getFechaDesdeObjectId(estudianteData._id) : 'Fecha desconocida';

      // 📌 Mostrar fecha de creación
      doc.setFontSize(12);
      doc.text(estudianteData 
        ? `Estudiante registrado en el sistema el día: ${fechaCreacion}` 
        : 'El estudiante ya no se encuentra en la base de datos actual.', 
        14, 28);

      autoTable(doc, {
        head: [['Fecha', 'Grado', 'Docente', 'Nota', 'Observación']],
        body: observacionesFiltradas.map(obs => [
          new Date(obs.fecha).toLocaleDateString(),
          obs.grupo || '-',
          obs.docente,
          obs.nota ?? '-',
          obs.observacion || '-'
        ]),
        startY: 35
      });

      doc.save(`observador_${nombreEstudiante}.pdf`);
    });
}


  filtrarUnaPorDocenteYFecha(data: any[]): any[] {
    const observacionesMap = new Map<string, any>();

    data.forEach(obs => {
      const clave = `${obs.docente}_${new Date(obs.fecha).toDateString()}`;
      if (!observacionesMap.has(clave)) {
        observacionesMap.set(clave, obs);
      }
    });

    return Array.from(observacionesMap.values());
  }
}
