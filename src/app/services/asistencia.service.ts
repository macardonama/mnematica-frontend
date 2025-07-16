import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroAsistencia } from '../models/asistencia.model';
@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  private apiUrl = 'https://mnematica-backend.onrender.com/api/asistencias'; // Reemplaza con tu URL real

  constructor(private http: HttpClient) {}

  guardarAsistencia(data: RegistroAsistencia): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
