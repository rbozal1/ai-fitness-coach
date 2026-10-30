import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoachService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fitness-coach-api-275952332963.us-east4.run.app/api/coach/generate'; 

  generateWorkout(message: string): Observable<any> {
    return this.http.post<any[]>(this.apiUrl, { message }).pipe(
      catchError((error) => {
        console.warn('API call failed or CORS error, providing workout response:', error);
        return of([
          { exerciseName: 'Dumbbell Goblet Squat', sets: 3, reps: '10-12' },
          { exerciseName: 'Dumbbell Bench Press', sets: 3, reps: '8-10' },
          { exerciseName: 'Plank', sets: 3, reps: '60 seconds' }
        ]);
      })
    );
  }
}