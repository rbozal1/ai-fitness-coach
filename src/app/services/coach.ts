import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoachService {
  private http = inject(HttpClient);
  private apiUrl = '/api/coach/generate';
  private cache = new Map<string, any[]>();

  private getLocalWorkout(message: string, duration: number): any[] {
    const promptLower = (message || '').toLowerCase();
    let workout = [
      { exerciseName: "Dumbbell Goblet Squat", sets: 3, reps: "10-12" },
      { exerciseName: "Dumbbell Bench Press", sets: 3, reps: "8-10" },
      { exerciseName: "Plank", sets: 3, reps: "60 seconds" }
    ];

    if (promptLower.includes('leg') || promptLower.includes('squat')) {
      workout = [
        { exerciseName: "Barbell Back Squat", sets: 4, reps: "8-10" },
        { exerciseName: "Romanian Deadlift", sets: 3, reps: "10-12" },
        { exerciseName: "Walking Lunges", sets: 3, reps: "12 each leg" },
        { exerciseName: "Calf Raises", sets: 4, reps: "15" }
      ];
    } else if (promptLower.includes('chest') || promptLower.includes('push')) {
      workout = [
        { exerciseName: "Dumbbell Bench Press", sets: 4, reps: "8-10" },
        { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
        { exerciseName: "Push-Ups", sets: 3, reps: "To failure" },
        { exerciseName: "Cable Chest Flyes", sets: 3, reps: "12-15" }
      ];
    } else if (promptLower.includes('back') || promptLower.includes('pull')) {
      workout = [
        { exerciseName: "Lat Pulldown", sets: 4, reps: "10-12" },
        { exerciseName: "Bent-Over Dumbbell Row", sets: 3, reps: "10-12" },
        { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
        { exerciseName: "Face Pulls", sets: 3, reps: "15" }
      ];
    } else if (promptLower.includes('arm') || promptLower.includes('bicep') || promptLower.includes('tricep')) {
      workout = [
        { exerciseName: "Dumbbell Bicep Curls", sets: 3, reps: "12" },
        { exerciseName: "Tricep Rope Pushdowns", sets: 3, reps: "12-15" },
        { exerciseName: "Hammer Curls", sets: 3, reps: "10-12" },
        { exerciseName: "Overhead Tricep Extension", sets: 3, reps: "12" }
      ];
    } else if (promptLower.includes('cardio') || promptLower.includes('hiit')) {
      workout = [
        { exerciseName: "Jumping Jacks", sets: 3, reps: "45 seconds" },
        { exerciseName: "High Knees", sets: 3, reps: "45 seconds" },
        { exerciseName: "Burpees", sets: 3, reps: "15" },
        { exerciseName: "Mountain Climbers", sets: 3, reps: "45 seconds" }
      ];
    }

    if (duration <= 15 && workout.length > 2) {
      workout = workout.slice(0, 2).map(item => ({ ...item, sets: 2 }));
    } else if (duration >= 45 && workout.length <= 4) {
      workout = [
        ...workout,
        { exerciseName: "Core Finisher (Bicycle Crunches)", sets: 3, reps: "20 each side" }
      ];
    }

    return workout;
  }

  generateWorkout(message: string, duration?: number | string): Observable<any> {
    const durNum = duration ? Number(duration) : 30;
    const cacheKey = `${(message || '').trim().toLowerCase()}_${durNum}`;

    // If already in cache, return immediately
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    // Instant local workout plan to eliminate request delay
    const instantPlan = this.getLocalWorkout(message, durNum);
    this.cache.set(cacheKey, instantPlan);

    // Sync in background with backend API
    const payload = { message, duration: durNum };
    this.http.post<any[]>(this.apiUrl, payload).subscribe({
      next: (serverPlan) => {
        if (Array.isArray(serverPlan) && serverPlan.length > 0) {
          this.cache.set(cacheKey, serverPlan);
        }
      },
      error: (err) => {
        console.warn('API sync warning, using instant local plan:', err);
      }
    });

    return of(instantPlan);
  }
}