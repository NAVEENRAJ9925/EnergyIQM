"""MongoDB connection for EnergyIQ ML service."""
import os
from pymongo import MongoClient
from bson import ObjectId

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/energyiq")
DB_NAME = "energyiq"
COLLECTION = "energyreadings"

_client = None


def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client


def get_readings(user_id: str = None, days: int = 90):
    """Fetch energy readings from MongoDB.

    If user_id is provided, only that user's readings are returned.
    If user_id is None, all readings are returned (global view).
    """
    from datetime import datetime, timedelta
    client = get_client()
    db = client[DB_NAME]
    coll = db[COLLECTION]
    start = datetime.utcnow() - timedelta(days=days)
    query = {"timestamp": {"$gte": start}}
    if user_id:
        query["userId"] = ObjectId(user_id)
    cursor = coll.find(query).sort("timestamp", 1)
    return list(cursor)
