import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import * as jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-asistencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgChartsModule],
  templateUrl: './dashboard-asistencia.component.html',
  styleUrls: ['./dashboard-asistencia.component.css']
})
export class DashboardAsistenciaComponent implements OnInit {
  fb = inject(FormBuilder);
  http = inject(HttpClient);

  filtroForm: FormGroup = this.fb.group({
    docente: [''],
      grupo: [''],            // ✅ Nuevo campo
    fechaInicio: [''],
    fechaFin: ['']
  });

  docentes: string[] = [];
  asistencias: any[] = [];
  estudiantes: string[] = [];
  fechas: string[] = [];
  tablaAsistencia: { [estudiante: string]: { [fecha: string]: string } } = {};

  ngOnInit(): void {
    this.http.get<any[]>('https://mnematica-backend.onrender.com/api/profesores')
      .subscribe(data => {
        this.docentes = data.map(p => p.nombre_docente);

      });
  }

 
buscarAsistencias() {
  const { docente, grupo, fechaInicio, fechaFin } = this.filtroForm.value;
  const url = `https://mnematica-backend.onrender.com/api/asistencias/docente?docente=${encodeURIComponent(docente)}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
  this.http.get<any[]>(url).subscribe(data => {
    // Filtra solo asistencias del grupo seleccionado
    this.asistencias = data.filter(a => a.grupo === grupo);
    this.procesarDatos();
  });
}




  procesarDatos() {
    const estudiantesSet = new Set<string>();
    const fechasSet = new Set<string>();
    this.tablaAsistencia = {};

    for (const asistencia of this.asistencias) {
      const estudiante = asistencia.nombre_estudiante;
      const fecha = asistencia.fecha;
      const estado = asistencia.estado;

      if (estado && estado.trim() !== '') {
        fechasSet.add(fecha);
      }

      estudiantesSet.add(estudiante);

      if (!this.tablaAsistencia[estudiante]) {
        this.tablaAsistencia[estudiante] = {};
      }

      this.tablaAsistencia[estudiante][fecha] = estado;
    }

    this.estudiantes = Array.from(estudiantesSet).sort();
    this.fechas = Array.from(fechasSet).sort();
  }

  generarPDF() {
    const doc = new jsPDF.default();
    const head = [['Estudiante', ...this.fechas]];
    const body = this.estudiantes.map(est => [
      est,
      ...this.fechas.map(f => this.tablaAsistencia[est]?.[f] || '-')
    ]);

    autoTable(doc, { head, body, startY: 20 });
    doc.save('reporte_asistencia.pdf');
  }

  generarPDFIndividual(nombre: string) {
    const doc = new jsPDF.default();
    const head = [['Fecha', 'Estado']];
    const body = this.fechas.map(f => [f, this.tablaAsistencia[nombre]?.[f] || '-']);

    doc.text(`Asistencia de: ${nombre}`, 14, 15);
    autoTable(doc, { head, body, startY: 20 });
    doc.save(`asistencia_${nombre}.pdf`);
  }

  exportarExcel() {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Estudiante', ...this.fechas],
      ...this.estudiantes.map(est => [
        est,
        ...this.fechas.map(f => this.tablaAsistencia[est]?.[f] || '-')
      ])
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencia');
    XLSX.writeFile(workbook, 'reporte_asistencia.xlsx');
  }

  calcularPorcentaje(estudiante: string): number {
    const total = this.fechas.length;
    const presente = this.fechas.filter(f => this.tablaAsistencia[estudiante]?.[f] === 'presente').length;
    return total > 0 ? Math.round((presente / total) * 100) : 0;
  }

  obtenerDatosGrafica(estudiante: string) {
    const presente = this.fechas.filter(f => this.tablaAsistencia[estudiante]?.[f] === 'presente').length;
    const ausente = this.fechas.length - presente;

    return {
      labels: ['Presente', 'Ausente'],
      datasets: [
        {
          data: [presente, ausente],
          backgroundColor: ['#4caf50', '#f44336']
        }
      ]
    };
  }
}
