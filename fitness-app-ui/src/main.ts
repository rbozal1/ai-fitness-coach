import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Correct import name and path

bootstrapApplication(AppComponent, appConfig) // Pass AppComponent to bootstrap
  .catch((err) => console.error(err));
