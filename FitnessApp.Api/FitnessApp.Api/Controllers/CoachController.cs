using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Mvc;

namespace FitnessApp.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoachController : ControllerBase
    {
        [HttpPost("generate")]
        public IActionResult GenerateWorkout([FromBody] UserPrompt request)
        {
            var mockWorkout = new[]
            {
                new { exerciseName = "Dumbbell Goblet Squat", sets = 3, reps = "10-12" },
                new { exerciseName = "Dumbbell Bench Press", sets = 3, reps = "8-10" },
                new { exerciseName = "Plank", sets = 3, reps = "60 seconds" }
            };

            return Ok(mockWorkout);
        }
    }

    public class UserPrompt
    {
        public string Message { get; set; }
    }
}
