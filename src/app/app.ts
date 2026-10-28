import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from './services/coach';

interface ExerciseStep {
  exerciseName: string;
  sets: number;
  reps: string;
  completed?: boolean;
}

interface WeatherItem {
  date: string;
  temperatureC: number;
  summary: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="nav-brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"/>
            </svg>
          </div>
          <span class="brand-title">AI Fitness Coach</span>
        </div>

        <nav class="nav-links">
          <a href="#planner" class="nav-link active">Planner</a>
          <a href="#routine" class="nav-link">Active Routine</a>
          <a href="#weather" class="nav-link">Outdoor Forecast</a>
        </nav>

        <div class="nav-actions">
          <button (click)="resetForm()" class="btn-ghost" title="Reset to default routine">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </header>

      <main class="main-content">
        <!-- Hero Section with Visual Image -->
        <section class="hero-card">
          <div class="hero-info">
            <div class="hero-badge">Smart Training Engine</div>
            <h1 class="hero-title">Personalized Workouts Tailored to Your Schedule</h1>
            <p class="hero-subtitle">
              Enter your fitness target or equipment preference, adjust your desired session duration, and get an instant custom workout routine designed for real results.
            </p>
            <div class="hero-meta">
              <span>Instant AI Generation</span>
              <span class="separator">·</span>
              <span>Dynamic Volume Scaling</span>
              <span class="separator">·</span>
              <span>Set Tracker</span>
            </div>
          </div>
          <div class="hero-image-wrap">
            <img src="/hero.jpg" alt="Athletic training session" class="hero-image" referrerpolicy="no-referrer" />
            <div class="image-overlay-tag">
              <span class="tag-dot"></span>
              <span>Personalized Coach Ready</span>
            </div>
          </div>
        </section>

        <!-- Workout Planner Card -->
        <section id="planner" class="planner-card">
          <div class="planner-header">
            <div>
              <h2 class="section-title">Configure Your Session</h2>
              <p class="section-desc">Choose a workout style or enter a custom prompt.</p>
            </div>
            <div class="quick-chips">
              <button 
                *ngFor="let p of quickPresets" 
                (click)="applyPreset(p.prompt, p.duration)"
                [class.active-chip]="prompt === p.prompt && duration === p.duration"
                class="preset-chip">
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Input Controls -->
          <div class="controls-grid">
            <div class="field-group prompt-field">
              <label class="field-label" for="promptInput">Workout Goal or Focus</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  id="promptInput"
                  [(ngModel)]="prompt" 
                  (keyup.enter)="getWorkout()"
                  placeholder="e.g., Dumbbell chest & arms, bodyweight core, legs..." 
                  class="text-input" />
              </div>
            </div>

            <div class="field-group duration-field">
              <label class="field-label" for="durationInput">Session Duration</label>
              <div class="duration-controls">
                <button type="button" (click)="adjustDuration(-5)" class="step-btn" title="Decrease 5 minutes">-</button>
                <div class="duration-display">
                  <input 
                    id="durationInput"
                    [(ngModel)]="duration" 
                    type="number" 
                    min="5" 
                    max="180" 
                    class="duration-input" />
                  <span class="unit">min</span>
                </div>
                <button type="button" (click)="adjustDuration(5)" class="step-btn" title="Increase 5 minutes">+</button>
              </div>
            </div>

            <div class="field-group action-field">
              <label class="field-label">&nbsp;</label>
              <button 
                (click)="getWorkout()" 
                [disabled]="loading" 
                class="btn-primary">
                <div *ngIf="loading" class="btn-spinner"></div>
                <svg *ngIf="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>{{ loading ? 'Generating...' : 'Build Workout' }}</span>
              </button>
            </div>
          </div>

          <!-- Quick Duration Selector Buttons -->
          <div class="duration-quick-row">
            <span class="quick-label">Presets:</span>
            <button 
              *ngFor="let mins of [15, 20, 30, 45, 60]" 
              (click)="setDuration(mins)"
              [class.active-time]="duration === mins"
              class="time-chip">
              {{ mins }} min
            </button>
          </div>
        </section>

        <!-- Loading Indicator -->
        <div *ngIf="loading" class="loading-state">
          <div class="loader-spinner"></div>
          <p class="loading-text">Crafting your tailored exercise sequence...</p>
        </div>

        <!-- Generated Routine View -->
        <section id="routine" *ngIf="!loading && workoutPlan.length > 0" class="routine-section">
          <div class="routine-header">
            <div>
              <div class="routine-eyebrow">Your Active Workout Routine</div>
              <h3 class="routine-title">{{ currentPlanTitle }}</h3>
            </div>
            
            <div class="routine-stats">
              <div class="stat-box">
                <span class="stat-value">{{ targetDuration || duration }}</span>
                <span class="stat-label">Minutes</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <span class="stat-value">{{ workoutPlan.length }}</span>
                <span class="stat-label">Exercises</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <span class="stat-value">{{ completedCount }}/{{ workoutPlan.length }}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-track">
            <div class="progress-bar" [style.width.%]="progressPercent"></div>
          </div>

          <!-- Exercise Cards List -->
          <div class="exercise-grid">
            <div 
              *ngFor="let step of workoutPlan; let i = index" 
              class="exercise-card"
              [class.completed-card]="step.completed">
              
              <div class="exercise-num">{{ i + 1 < 10 ? '0' + (i + 1) : i + 1 }}</div>

              <div class="exercise-body">
                <h4 class="exercise-title" [class.strike]="step.completed">{{ step.exerciseName }}</h4>
                <div class="exercise-meta">
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <strong>{{ step.sets }}</strong> Sets
                  </span>
                  <span class="meta-dot">·</span>
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <strong>{{ step.reps }}</strong>
                  </span>
                  <span class="meta-dot">·</span>
                  <span class="meta-rest">60s rest between sets</span>
                </div>
              </div>

              <button 
                type="button" 
                (click)="toggleCompleted(step)"
                class="check-btn"
                [class.checked]="step.completed"
                title="Mark exercise as finished">
                <svg *ngIf="step.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span *ngIf="!step.completed" class="check-empty"></span>
              </button>
            </div>
          </div>

          <!-- Routine Footer Controls -->
          <div class="routine-footer">
            <div class="footer-tip">
              💡 <em>Tip: Maintain steady form, control the eccentric phase, and stay hydrated throughout your routine.</em>
            </div>
            <button 
              *ngIf="completedCount === workoutPlan.length" 
              (click)="resetCompleted()" 
              class="btn-celebrate">
              🎉 Routine Complete! Restart Tracker
            </button>
          </div>
        </section>

        <!-- Outdoor Training Weather Card -->
        <section id="weather" class="weather-card">
          <div class="weather-header">
            <div>
              <span class="weather-kicker">Environment & Mobility</span>
              <h3 class="weather-title">Outdoor Training & Running Forecast</h3>
              <p class="weather-subtitle">Live 5-day weather conditions to plan indoor vs outdoor workouts.</p>
            </div>
            <button (click)="loadWeather()" class="btn-refresh" title="Refresh weather data">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Update</span>
            </button>
          </div>

          <div class="forecast-grid">
            <div *ngFor="let item of weatherForecast" class="forecast-item">
              <div class="forecast-day">{{ formatDay(item.date) }}</div>
              <div class="forecast-temp">{{ item.temperatureC }}°C</div>
              <div class="forecast-summary">{{ item.summary }}</div>
              <div class="forecast-badge" [class.outdoor-good]="isGoodForOutdoor(item.temperatureC, item.summary)">
                {{ isGoodForOutdoor(item.temperatureC, item.summary) ? '🏃 Run Outside' : '🏋️ Train Indoors' }}
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <p>© 2026 AI Fitness Coach · Powered by intelligent adaptive workout synthesis</p>
      </footer>
    </div>
  `,
  styles: [`
    /* Container & Layout */
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      color: #0f172a;
    }

    /* Top Navigation */
    .top-nav {
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 1.5rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #e2e8f0;
      max-width: 100%;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #0f172a;
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-title {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    .nav-links {
      display: none;
      align-items: center;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .nav-links {
        display: flex;
      }
    }

    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .nav-link:hover, .nav-link.active {
      color: #0f172a;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-ghost:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Main Container */
    .main-content {
      width: 100%;
      max-width: 1080px;
      margin: 0 auto;
      padding: 1.5rem 1rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Hero Card */
    .hero-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      align-items: center;
    }

    @media (min-width: 840px) {
      .hero-card {
        grid-template-columns: 1.2fr 0.9fr;
      }
    }

    .hero-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #059669;
      background: #ecfdf5;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .hero-title {
      font-size: clamp(1.625rem, 3.5vw, 2.25rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin-bottom: 0.875rem;
    }

    .hero-subtitle {
      font-size: 0.9375rem;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }

    .hero-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      color: #64748b;
      font-weight: 500;
      flex-wrap: wrap;
    }

    .separator {
      color: #cbd5e1;
    }

    .hero-image-wrap {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 16 / 9;
      background: #0f172a;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    .hero-image-wrap:hover .hero-image {
      transform: scale(1.02);
    }

    .image-overlay-tag {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(6px);
      color: #f8fafc;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tag-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
    }

    /* Planner Card */
    .planner-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 1.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .planner-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
      .planner-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .section-desc {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 2px;
    }

    .quick-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .preset-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .preset-chip:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .preset-chip.active-chip {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    /* Controls Grid */
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      align-items: flex-end;
    }

    @media (min-width: 768px) {
      .controls-grid {
        grid-template-columns: 1fr 180px 170px;
      }
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #334155;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      pointer-events: none;
    }

    .text-input {
      width: 100%;
      height: 46px;
      padding: 0 14px 0 42px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.9375rem;
      color: #0f172a;
      transition: all 0.15s ease;
    }

    .text-input:focus {
      outline: none;
      border-color: #10b981;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .duration-controls {
      display: flex;
      align-items: center;
      height: 46px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
    }

    .step-btn {
      width: 40px;
      height: 100%;
      background: transparent;
      border: none;
      font-size: 1.125rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .step-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .duration-display {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .duration-input {
      width: 44px;
      border: none;
      background: transparent;
      text-align: center;
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      outline: none;
    }

    .unit {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
    }

    .btn-primary {
      height: 46px;
      width: 100%;
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
    }

    .btn-primary:hover:not(:disabled) {
      background: #1e293b;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(15, 23, 42, 0.15);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .duration-quick-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .quick-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .time-chip {
      background: transparent;
      border: 1px dashed #cbd5e1;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .time-chip:hover {
      border-color: #0f172a;
      color: #0f172a;
    }

    .time-chip.active-time {
      background: #e2e8f0;
      border-style: solid;
      border-color: #94a3b8;
      font-weight: 600;
      color: #0f172a;
    }

    /* Loading State */
    .loading-state {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loader-spinner {
      width: 36px;
      height: 36px;
      border: 3.5px solid #e2e8f0;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #64748b;
    }

    /* Routine Section */
    .routine-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .routine-header {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }

    @media (min-width: 640px) {
      .routine-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
    }

    .routine-eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      color: #10b981;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .routine-title {
      font-size: 1.375rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-top: 2px;
    }

    .routine-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 16px;
      border-radius: 12px;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 1.125rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }

    .stat-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    .stat-divider {
      width: 1px;
      height: 24px;
      background: #e2e8f0;
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s ease;
    }

    /* Exercise Grid */
    .exercise-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .exercise-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      transition: all 0.2s ease;
    }

    .exercise-card:hover {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .exercise-card.completed-card {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .exercise-num {
      font-size: 1.125rem;
      font-weight: 800;
      color: #94a3b8;
      font-variant-numeric: tabular-nums;
      width: 28px;
    }

    .exercise-card.completed-card .exercise-num {
      color: #10b981;
    }

    .exercise-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .exercise-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .exercise-title.strike {
      text-decoration: line-through;
      color: #64748b;
    }

    .exercise-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      color: #475569;
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .meta-item svg {
      color: #64748b;
    }

    .meta-dot {
      color: #cbd5e1;
    }

    .meta-rest {
      color: #64748b;
      font-size: 0.75rem;
    }

    .check-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 2px solid #cbd5e1;
      background: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      color: #ffffff;
      flex-shrink: 0;
    }

    .check-btn:hover {
      border-color: #10b981;
    }

    .check-btn.checked {
      background: #10b981;
      border-color: #10b981;
    }

    .check-empty {
      width: 10px;
      height: 10px;
    }

    .routine-footer {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .routine-footer {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .footer-tip {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .btn-celebrate {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-celebrate:hover {
      background: #059669;
    }

    /* Weather Card */
    .weather-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 1.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .weather-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .weather-kicker {
      font-size: 0.75rem;
      font-weight: 700;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .weather-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }

    .weather-subtitle {
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 2px;
    }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
    }

    .btn-refresh:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .forecast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .forecast-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .forecast-day {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #475569;
    }

    .forecast-temp {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      font-variant-numeric: tabular-nums;
    }

    .forecast-summary {
      font-size: 0.75rem;
      color: #64748b;
      min-height: 1.2rem;
    }

    .forecast-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 6px;
      background: #e2e8f0;
      color: #334155;
      margin-top: 6px;
    }

    .forecast-badge.outdoor-good {
      background: #ecfdf5;
      color: #059669;
    }

    /* Footer */
    .app-footer {
      margin-top: auto;
      text-align: center;
      padding: 1.5rem;
      font-size: 0.8125rem;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
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
  
  prompt = 'Full body strength & core';
  duration: number = 30;
  targetDuration: number = 30;
  workoutPlan: ExerciseStep[] = [];
  weatherForecast: WeatherItem[] = [];
  loading: boolean = false;

  quickPresets = [
    { label: '🏋️ Full Body', prompt: 'Full body strength & core', duration: 30 },
    { label: '💥 Chest & Push', prompt: 'Dumbbell chest & push-ups', duration: 30 },
    { label: '🦵 Legs & Quads', prompt: 'Barbell squats and lunges', duration: 30 },
    { label: '⚡ HIIT Cardio', prompt: 'High intensity cardio bodyweight', duration: 15 },
    { label: '💪 Arms & Core', prompt: 'Biceps, triceps and plank focus', duration: 20 },
    { label: '🧘 Mobility', prompt: 'Mobility and active recovery', duration: 15 }
  ];

  get currentPlanTitle(): string {
    const p = (this.prompt || '').trim();
    if (!p) return 'Custom Workout Plan';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  get completedCount(): number {
    return this.workoutPlan.filter(step => step.completed).length;
  }

  get progressPercent(): number {
    if (!this.workoutPlan.length) return 0;
    return Math.round((this.completedCount / this.workoutPlan.length) * 100);
  }

  ngOnInit() {
    this.getWorkout();
    this.loadWeather();
  }

  applyPreset(prompt: string, duration: number) {
    this.prompt = prompt;
    this.duration = duration;
    this.getWorkout();
  }

  adjustDuration(delta: number) {
    const next = (this.duration || 30) + delta;
    this.duration = Math.max(5, Math.min(180, next));
  }

  setDuration(mins: number) {
    this.duration = mins;
  }

  toggleCompleted(step: ExerciseStep) {
    step.completed = !step.completed;
  }

  resetCompleted() {
    this.workoutPlan.forEach(step => step.completed = false);
  }

  resetForm() {
    this.prompt = 'Full body strength & core';
    this.duration = 30;
    this.getWorkout();
  }

  getWorkout() {
    this.loading = true;
    this.coachService.generateWorkout(this.prompt, this.duration).subscribe({
      next: (data) => {
        this.workoutPlan = (data || []).map((step: any) => ({
          exerciseName: step.exerciseName,
          sets: step.sets,
          reps: step.reps,
          completed: false
        }));
        this.targetDuration = this.duration;
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
      }
    });
  }

  loadWeather() {
    this.coachService.getWeatherForecast().subscribe({
      next: (data) => {
        this.weatherForecast = data || [];
      },
      error: (err) => {
        console.warn('Weather forecast load error:', err);
      }
    });
  }

  formatDay(dateStr: string): string {
    if (!dateStr) return 'Day';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  isGoodForOutdoor(tempC: number, summary: string): boolean {
    const s = (summary || '').toLowerCase();
    if (s.includes('freezing') || s.includes('scorching') || s.includes('rain')) {
      return false;
    }
    return tempC >= 12 && tempC <= 26;
  }
}