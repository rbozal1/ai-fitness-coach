using Microsoft.EntityFrameworkCore;
using FitnessApp.Api;
using FitnessApp.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Cloud Run dynamic port configuration
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Register PostgreSQL DbContext
builder.Services.AddDbContext<FitnessDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 1. Add CORS policy for Angular (supporting local dev and deployed Cloud Run origin)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Swagger & OpenAPI configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add controller services to container
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FitnessDbContext>();
    db.Database.EnsureCreated(); // Or db.Database.Migrate(); if using EF Migrations
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // In Cloud Run, SSL termination is handled by GCP ingress load balancer.
    // Avoid HTTPS redirection in production containers to prevent probe failures and redirect loops.
}

// Optional root/health check endpoint for Cloud Run container probes
app.MapGet("/", () => Results.Ok(new { status = "healthy", service = "FitnessApp.Api" }));

app.UseCors("AllowAngularApp");

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Endpoint to generate and save a workout
app.MapPost("/api/workout", async (WorkoutRequest req, FitnessDbContext db) =>
{
    // In production, this is where you call the Gemini AI API using req.Prompt.
    // For now, we generate dynamic objects to save to the database.
    var session = new WorkoutSession
    {
        Prompt = req.Prompt,
        Steps = new List<WorkoutStep>
        {
            new WorkoutStep { ExerciseName = "Dynamic AI Squat", Sets = 4, Reps = "8-10" },
            new WorkoutStep { ExerciseName = "Dynamic AI Push", Sets = 3, Reps = "12" }
        }
    };

    db.WorkoutSessions.Add(session);
    await db.SaveChangesAsync(); // Executes the SQL INSERT statements

    return Results.Ok(session.Steps);
});

app.Run();
