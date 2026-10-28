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

const serverCache = new Map();

// Coach API endpoint migrated from C# CoachController.cs
app.post('/api/coach/generate', (req, res) => {
  const { message, duration } = req.body || {};
  const mins = duration ? parseInt(duration, 10) : 30;
  const cacheKey = `${(message || '').trim().toLowerCase()}_${mins}`;

  if (serverCache.has(cacheKey)) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(serverCache.get(cacheKey));
  }

  // Default mock workout matching CoachController.cs
  let workout = [
    { exerciseName: "Dumbbell Goblet Squat", sets: 3, reps: "10-12" },
    { exerciseName: "Dumbbell Bench Press", sets: 3, reps: "8-10" },
    { exerciseName: "Plank", sets: 3, reps: "60 seconds" }
  ];

  const promptLower = (message || '').toLowerCase();
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

  // If user requested a short quick workout (e.g. 15 mins or less), trim to 2-3 exercises
  if (mins <= 15 && workout.length > 2) {
    workout = workout.slice(0, 2).map(item => ({ ...item, sets: 2 }));
  } else if (mins >= 45 && workout.length <= 4) {
    // Add cool-down or finisher for longer workouts
    workout = [
      ...workout,
      { exerciseName: "Core Finisher (Bicycle Crunches)", sets: 3, reps: "20 each side" }
    ];
  }

  serverCache.set(cacheKey, workout);
  res.setHeader('X-Cache', 'MISS');
  return res.json(workout);
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
const distPath = path.join(__dirname, 'dist', 'fitness-app-ui', 'browser');

if (!fs.existsSync(distPath)) {
  console.log('Building frontend before server start...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
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
