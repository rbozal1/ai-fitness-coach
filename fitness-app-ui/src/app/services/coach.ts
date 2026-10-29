import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoachService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fitness-coach-api-275952332963.us-east4.run.app/api/coach/generate'; 

  generateWorkout(message: string): Observable<any> {
    return this.http.post(this.apiUrl, { message });
  }
}