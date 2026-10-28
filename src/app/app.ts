import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from './services/coach';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif; max-width: 650px;">
      <h2>AI Fitness Coach</h2>
      <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;">
        <input [(ngModel)]="prompt" placeholder="Ask for a workout..." style="flex: 1; min-width: 220px; padding: 8px;" />
        <input [(ngModel)]="duration" type="number" min="5" max="180" placeholder="Duration (mins)" style="width: 140px; padding: 8px;" />
        <button (click)="getWorkout()" [disabled]="loading" style="padding: 8px 16px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px;">
          {{ loading ? 'Generating...' : 'Send' }}
        </button>
      </div>

      <!-- Quick Preset Suggestions for Instant Workouts -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
        <span style="font-size: 13px; color: #666; align-self: center;">Quick picks:</span>
        <button *ngFor="let p of quickPresets" (click)="applyPreset(p.prompt, p.duration)"
                style="font-size: 12px; padding: 4px 10px; background: #e9ecef; border: 1px solid #ced4da; border-radius: 12px; cursor: pointer;">
          {{ p.label }}
        </button>
      </div>

      <div *ngIf="loading" class="spinner-container">
        <div class="spinner"></div>
        <span>Generating your workout...</span>
      </div>

      <div *ngIf="targetDuration && !loading" style="color: #555; margin-top: 10px; font-size: 14px;">
        <em>Target duration: {{ targetDuration }} minutes</em>
      </div>

      <ul *ngIf="!loading" style="margin-top: 20px; padding-left: 20px;">
        <li *ngFor="let step of workoutPlan" style="margin-bottom: 8px;">
          <strong>{{ step.exerciseName }}</strong>: {{ step.sets }} sets of {{ step.reps }}
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 16px;
      color: #555;
      font-size: 14px;
    }
    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #007bff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class AppComponent implements OnInit {
  coachService = inject(CoachService);
  prompt = 'Give me a workout';
  duration: number = 30;
  targetDuration: number | null = null;
  workoutPlan: any[] = [];
  loading: boolean = false;

  quickPresets = [
    { label: 'Full Body (30m)', prompt: 'Full body workout', duration: 30 },
    { label: 'Chest & Push (30m)', prompt: 'Chest workout', duration: 30 },
    { label: 'Legs & Squats (30m)', prompt: 'Leg workout', duration: 30 },
    { label: 'Quick HIIT (15m)', prompt: 'HIIT cardio workout', duration: 15 },
    { label: 'Arms (20m)', prompt: 'Arm workout', duration: 20 }
  ];

  ngOnInit() {
    // Automatically generate workout on initial load for instant readiness
    this.getWorkout();
  }

  applyPreset(prompt: string, duration: number) {
    this.prompt = prompt;
    this.duration = duration;
    this.getWorkout();
  }

  getWorkout() {
    this.loading = true;
    this.coachService.generateWorkout(this.prompt, this.duration).subscribe({
      next: (data) => {
        this.workoutPlan = data;
        this.targetDuration = this.duration;
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
      }
    });
  }
}