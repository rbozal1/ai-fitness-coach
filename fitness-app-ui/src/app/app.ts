import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from './services/coach';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  coachService = inject(CoachService);
  prompt = 'Full body strength & core';
  duration = 30;
  workoutPlan: any[] = [];

  // Updates the input box when a quick-select button is clicked
  setCategory(category: string) {
    this.prompt = category;
  }

  // Increases or decreases time (limits between 5 and 120 minutes)
  adjustDuration(change: number) {
    const newDuration = this.duration + change;
    if (newDuration >= 5 && newDuration <= 120) {
      this.duration = newDuration;
    }
  }

  // Clears the current workout and resets defaults
  reset() {
    this.prompt = 'Full body strength & core';
    this.duration = 30;
    this.workoutPlan = [];
  }

  getWorkout() {
    // Combines user intent and selected duration before sending to C# API
    const finalPrompt = `${this.prompt} for ${this.duration} minutes`;
    
    this.coachService.generateWorkout(finalPrompt).subscribe({
      next: (data) => this.workoutPlan = data,
      error: (err) => console.error('API Error:', err)
    });
  }
}