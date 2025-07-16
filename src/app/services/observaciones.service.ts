import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {
  private apiUrl = 'https://mnematica-backend.onrender.com/api/observaciones';

  constructor(private http: HttpClient) {}

  guardarObservacion(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}
