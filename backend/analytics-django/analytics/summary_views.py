from django.http import JsonResponse
import random

def generate_incident_summary(request):
    """
    Generates a natural-language summary of the incident using rule-based templating.
    (In a real system, this would use an LLM).
    """
    service = request.GET.get('service', 'auth-service')
    timestamp = request.GET.get('timestamp', '10:00 UTC')
    
    # Mock analysis patterns
    summaries = [
        f"At {timestamp}, a configuration change in {service} ('JWT_EXPIRY') reduced token validity from 15m to 5ms, causing a spike in authentication failures.",
        f"A deployment of {service} v1.4.2 at {timestamp} introduced a regression in the login flow, correlated with increased latency.",
        f"Feature flag 'new-auth-flow' was enabled for 100% of users in {service}, leading to 500 errors starting at {timestamp}."
    ]
    
    # Randomly select a template for demo purposes
    summary = random.choice(summaries)
    
    return JsonResponse({
        "service": service,
        "timestamp": timestamp,
        "generated_summary": summary,
        "model": "Rule-Based-NLP-v1"
    })
