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
  // Opciones unificadas del selector
gruposUnificados = [
  { label: 'Todos',          values: [] },
  { label: '6°',             values: ['6°'] },
  { label: '7°–8°',          values: ['7°', '8°'] },
  { label: '9°–10°–11°',     values: ['9°', '10°', '11°'] },
];

// Normaliza el formato del grupo que llega del backend
private normGrupo(g: string = ''): string {
  const t = (g ?? '').trim();
  return t && !t.endsWith('°') ? `${t}°` : t;
}

  filtroForm: FormGroup = this.fb.group({
    docente: [''],
    grupo: [''],
    fechaInicio: [''],
    fechaFin: ['']
  });

  docentes: string[] = [];
  asistencias: any[] = [];
  estudiantes: string[] = [];
  fechas: string[] = [];
  tablaAsistencia: { [estudiante: string]: { [fecha: string]: string } } = {};

  resumenEstados: any = {};

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
  // normaliza grupos
  const dataNorm = (data || []).map(a => ({ ...a, grupo: this.normGrupo(a.grupo) }));

  // convierte la etiqueta elegida en lista de grados reales
  const sel = this.gruposUnificados.find(x => x.label === grupo);

  this.asistencias = (!sel || sel.values.length === 0)
    ? dataNorm                                  // "Todos": no filtra por grupo
    : dataNorm.filter(a => sel.values.includes(a.grupo));

  this.procesarDatos();
  this.calcularResumen();
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

  calcularResumen() {
    this.resumenEstados = {
      presente: 0,
      ausente: 0,
      'en cuarto': 0,
      hospitalizado: 0,
      egreso: 0
    };

    this.asistencias.forEach((est: any) => {
      const estado = (est.estado || '').toLowerCase().trim();
      if (this.resumenEstados.hasOwnProperty(estado)) {
        this.resumenEstados[estado]++;
      }
    });
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
