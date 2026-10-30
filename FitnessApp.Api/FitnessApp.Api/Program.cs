var builder = WebApplication.CreateBuilder(args);

// Cloud Run dynamic port configuration
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

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

app.Run();
