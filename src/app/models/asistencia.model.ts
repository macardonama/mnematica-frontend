export interface AsistenciaEstudiante {
  nombre_estudiante: string;
  estado: 'presente' | 'ausente' | 'cita' | 'en cuarto' | 'hospitalizado';
  emocion?: string;  // Solo si es presente
}

export interface RegistroAsistencia {
  docente: string;
  grupo: string;
  fecha: string; // Se genera automáticamente
  asistencias: AsistenciaEstudiante[];
}
