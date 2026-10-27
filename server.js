import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Coach API endpoint migrated from C# CoachController.cs
app.post('/api/coach/generate', (req, res) => {
  const { message } = req.body || {};

  // Default mock workout matching CoachController.cs
  const defaultWorkout = [
    { exerciseName: "Dumbbell Goblet Squat", sets: 3, reps: "10-12" },
    { exerciseName: "Dumbbell Bench Press", sets: 3, reps: "8-10" },
    { exerciseName: "Plank", sets: 3, reps: "60 seconds" }
  ];

  const promptLower = (message || '').toLowerCase();
  if (promptLower.includes('leg') || promptLower.includes('squat')) {
    return res.json([
      { exerciseName: "Barbell Back Squat", sets: 4, reps: "8-10" },
      { exerciseName: "Romanian Deadlift", sets: 3, reps: "10-12" },
      { exerciseName: "Walking Lunges", sets: 3, reps: "12 each leg" },
      { exerciseName: "Calf Raises", sets: 4, reps: "15" }
    ]);
  }

  if (promptLower.includes('chest') || promptLower.includes('push')) {
    return res.json([
      { exerciseName: "Dumbbell Bench Press", sets: 4, reps: "8-10" },
      { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
      { exerciseName: "Push-Ups", sets: 3, reps: "To failure" },
      { exerciseName: "Cable Chest Flyes", sets: 3, reps: "12-15" }
    ]);
  }

  if (promptLower.includes('back') || promptLower.includes('pull')) {
    return res.json([
      { exerciseName: "Lat Pulldown", sets: 4, reps: "10-12" },
      { exerciseName: "Bent-Over Dumbbell Row", sets: 3, reps: "10-12" },
      { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
      { exerciseName: "Face Pulls", sets: 3, reps: "15" }
    ]);
  }

  if (promptLower.includes('arm') || promptLower.includes('bicep') || promptLower.includes('tricep')) {
    return res.json([
      { exerciseName: "Dumbbell Bicep Curls", sets: 3, reps: "12" },
      { exerciseName: "Tricep Rope Pushdowns", sets: 3, reps: "12-15" },
      { exerciseName: "Hammer Curls", sets: 3, reps: "10-12" },
      { exerciseName: "Overhead Tricep Extension", sets: 3, reps: "12" }
    ]);
  }

  if (promptLower.includes('cardio') || promptLower.includes('hiit')) {
    return res.json([
      { exerciseName: "Jumping Jacks", sets: 3, reps: "45 seconds" },
      { exerciseName: "High Knees", sets: 3, reps: "45 seconds" },
      { exerciseName: "Burpees", sets: 3, reps: "15" },
      { exerciseName: "Mountain Climbers", sets: 3, reps: "45 seconds" }
    ]);
  }

  return res.json(defaultWorkout);
});

// Weather forecast endpoint migrated from C# WeatherForecastController.cs
const weatherSummaries = [
  "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
];

const getWeatherForecast = () => {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      date: d.toISOString().split('T')[0],
      temperatureC: Math.floor(Math.random() * 75) - 20,
      summary: weatherSummaries[Math.floor(Math.random() * weatherSummaries.length)]
    };
  });
};

app.get('/WeatherForecast', (req, res) => {
  res.json(getWeatherForecast());
});

app.get('/api/weatherforecast', (req, res) => {
  res.json(getWeatherForecast());
});

// Serve frontend static files
const distPath = path.join(__dirname, 'fitness-app-ui', 'dist', 'fitness-app-ui', 'browser');

if (!fs.existsSync(distPath)) {
  console.log('Building frontend before server start...');
  try {
    execSync('npm run build:frontend', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to build frontend:', err);
  }
}

app.use(express.static(distPath));

// SPA fallback for Angular routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Please build fitness-app-ui.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Fitness Coach server running on http://0.0.0.0:${PORT}`);
});
