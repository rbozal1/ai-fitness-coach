import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from './services/coach';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>AI Fitness Coach</h2>
      <input [(ngModel)]="prompt" placeholder="Ask for a workout..." />
      <button (click)="getWorkout()">Send</button>

      <ul style="margin-top: 20px;">
        <li *ngFor="let step of workoutPlan">
          <strong>{{ step.exerciseName }}</strong>: {{ step.sets }} sets of {{ step.reps }}
        </li>
      </ul>
    </div>
  `
})
export class AppComponent {
  coachService = inject(CoachService);
  prompt = 'Give me a workout';
  workoutPlan: any[] = [];

  getWorkout() {
    this.coachService.generateWorkout(this.prompt).subscribe({
      next: (data) => this.workoutPlan = data,
      error: (err) => console.error('API Error:', err)
    });
  }
}