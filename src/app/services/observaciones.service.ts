import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {
  private apiUrl = 'http://localhost:3000/api/observaciones';

  constructor(private http: HttpClient) {}

  guardarObservacion(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}
