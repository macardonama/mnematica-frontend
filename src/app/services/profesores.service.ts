import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfesoresService {
  private apiUrl = 'https://mnematica-backend.onrender.com/api/profesores'; // Reemplaza con tu URL real

  constructor(private http: HttpClient) {}

  obtenerProfesores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
