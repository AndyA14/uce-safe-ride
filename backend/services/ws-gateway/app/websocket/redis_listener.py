import json
from app.websocket.manager import manager
from app.core.redis import redis_client


async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.psubscribe("route:*")

    async for message in pubsub.listen():
        if message["type"] != "pmessage":
            continue

        channel = message["channel"] 
        route_id = channel.split(":")[1]
        payload = json.loads(message["data"])

        await manager.send_to_route(route_id, payload)
