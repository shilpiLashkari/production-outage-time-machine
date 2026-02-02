from django.http import JsonResponse
from collections import defaultdict
import datetime
import json

def rank_root_causes(request):
    """
    AI Heuristic Engine for Root Cause Ranking.
    Arguments:
    - timestamp (ISO String): Time of the outage/incident.
    - service (String): Target service scope.
    """
    timestamp_str = request.GET.get('timestamp')
    service = request.GET.get('service')

    if not timestamp_str or not service:
        return JsonResponse({'error': 'Missing timestamp or service'}, status=400)

    # Mock Data Fetching (In prod: Fetch from Postgres/Mongo)
    # Heuristics:
    # 1. Temporal Proximity: Changes closest to failure time are suspicious.
    # 2. Impact Weight: Config > Flags > Code (for immediate failures).
    # 3. Newness: Recently changed keys are more likely culprits.

    # Imported from separate file
    from .mock_data import MOCK_CANDIDATES
    candidates = MOCK_CANDIDATES

    # Weighted Scoring Algorithm
    ranked_causes = []
    for c in candidates:
        # Simple Decay Formula: Score = BaseConfidence * (1 / (1 + decay * time_diff))
        time_decay = 1 / (1 + 0.001 * c['time_diff_seconds'])
        final_score = c['confidence'] * time_decay
        
        ranked_causes.append({
            **c,
            "ai_score": round(final_score, 2),
            "reasoning": f"High temporal correlation ({c['time_diff_seconds']}s before incident)"
        })

    # Sort by Score
    ranked_causes.sort(key=lambda x: x['ai_score'], reverse=True)

    return JsonResponse({
        "analysis_timestamp": datetime.datetime.now().isoformat(),
        "root_causes": ranked_causes
    })
