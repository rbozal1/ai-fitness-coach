using Microsoft.EntityFrameworkCore;
using FitnessApp.Api.Models;

namespace FitnessApp.Api
{
    public class FitnessDbContext : DbContext
    {
        public FitnessDbContext(DbContextOptions<FitnessDbContext> options) : base(options) { }

        public DbSet<WorkoutSession> WorkoutSessions { get; set; }
        public DbSet<WorkoutStep> WorkoutSteps { get; set; }
    }
}
