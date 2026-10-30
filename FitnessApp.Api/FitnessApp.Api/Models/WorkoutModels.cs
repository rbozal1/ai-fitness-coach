namespace FitnessApp.Api.Models
{
    public class WorkoutSession
    {
        public int Id { get; set; }
        public string Prompt { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<WorkoutStep> Steps { get; set; } = new();
    }

    public class WorkoutStep
    {
        public int Id { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public int Sets { get; set; }
        public string Reps { get; set; } = string.Empty;
        public int WorkoutSessionId { get; set; }
    }

    public class WorkoutRequest
    {
        public string Prompt { get; set; } = string.Empty;
    }
}
