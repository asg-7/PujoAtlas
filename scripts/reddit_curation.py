import os
import json
import re
import time
import requests
from typing import Dict, List, Any

# ==============================================================================
# T-25: Reddit & Social Extraction Pipeline (Python)
# 
# Purpose: Parses public posts from r/kolkata to extract crowd reports,
# hidden gems, and late-night food joints. Converts raw markdown/text into
# a structured schema compatible with Pujo Pathfinder.
# ==============================================================================

CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET", "")
USER_AGENT = "PujoPathfinder/1.0 (Data Extraction ETL)"

SUBREDDIT = "kolkata"
SEARCH_TERMS = ["pandal crowd", "hidden gem pujo", "late night food pujo", "best pandal"]

def get_reddit_token() -> str:
    """Fetch OAuth token from Reddit API."""
    if not CLIENT_ID or not CLIENT_SECRET:
        print("⚠️ Warning: No Reddit API credentials found. Using public JSON endpoints (rate-limited).")
        return ""
    
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    data = {'grant_type': 'client_credentials'}
    headers = {'User-Agent': USER_AGENT}
    res = requests.post('https://www.reddit.com/api/v1/access_token', auth=auth, data=data, headers=headers)
    return res.json().get('access_token', '')

def fetch_threads(query: str, token: str, limit: int = 25) -> List[Dict[str, Any]]:
    """Fetch search results from r/kolkata."""
    headers = {'User-Agent': USER_AGENT}
    if token:
        headers['Authorization'] = f"bearer {token}"
        url = f"https://oauth.reddit.com/r/{SUBREDDIT}/search"
    else:
        url = f"https://www.reddit.com/r/{SUBREDDIT}/search.json"
        
    params = {'q': query, 'restrict_sr': 'true', 'limit': limit, 'sort': 'relevance'}
    res = requests.get(url, headers=headers, params=params)
    
    if res.status_code != 200:
        print(f"Error fetching {query}: {res.status_code}")
        return []
        
    data = res.json()
    return data.get('data', {}).get('children', [])

def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    NLP/Regex heuristic extraction to find entity names, times, and zones.
    In a full production environment, this would use spaCy or an LLM API.
    """
    entities = []
    
    # Heuristic 1: Time mentions (e.g., 2 AM, 3:30 PM, midnight)
    time_mentions = re.findall(r'\b(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:AM|PM|am|pm)\b', text)
    
    # Heuristic 2: Queue / Crowd mentions
    is_crowded = bool(re.search(r'(crowded|huge line|packed|avoid|stampede|crush)', text.lower()))
    is_empty = bool(re.search(r'(empty|no line|breeze|peaceful|faka)', text.lower()))
    
    # If text is rich enough, treat it as a potential lead
    if len(text) > 50 and (time_mentions or is_crowded or is_empty):
        entities.append({
            "raw_text_snippet": text[:200] + "...",
            "extracted_times": time_mentions,
            "crowd_status": "HIGH" if is_crowded else "LOW" if is_empty else "UNKNOWN",
            "needs_manual_review": True
        })
        
    return entities

def run_pipeline():
    print("🚀 Starting Reddit ETL Pipeline for Pujo Pathfinder...")
    token = get_reddit_token()
    
    curated_data = []
    
    for term in SEARCH_TERMS:
        print(f"🔍 Searching for: '{term}'")
        threads = fetch_threads(term, token)
        
        for thread in threads:
            post = thread['data']
            title = post.get('title', '')
            body = post.get('selftext', '')
            url = post.get('url', '')
            
            # Combine text
            full_text = f"{title}\n{body}"
            extracted = extract_entities(full_text)
            
            for ext in extracted:
                ext['sourceUrls'] = [{'platform': 'reddit', 'url': url}]
                curated_data.append(ext)
                
        # Rate limit compliance
        time.sleep(1.5)
        
    # Output to JSON for manual review
    out_dir = os.path.join(os.path.dirname(__file__), '../data/raw')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'reddit_curated_leads.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(curated_data, f, indent=2)
        
    print(f"✅ ETL Pipeline complete. Generated {len(curated_data)} leads in {out_path}.")

if __name__ == "__main__":
    run_pipeline()
