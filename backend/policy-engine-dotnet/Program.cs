var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => new { Status = "UP", Service = "policy-engine" });

app.Run();
