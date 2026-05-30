import asyncio
import logging
from collections.abc import AsyncGenerator

logger = logging.getLogger(__name__)


class EventBroadcaster:
    """Simple in-memory SSE broadcaster for dashboard live feed."""

    def __init__(self) -> None:
        self._queues: list[asyncio.Queue[str]] = []

    async def subscribe(self) -> AsyncGenerator[str, None]:
        queue: asyncio.Queue[str] = asyncio.Queue()
        self._queues.append(queue)
        try:
            while True:
                data = await queue.get()
                yield data
        finally:
            self._queues.remove(queue)

    async def publish(self, data: str) -> None:
        dead_queues: list[asyncio.Queue[str]] = []
        for queue in self._queues:
            try:
                queue.put_nowait(data)
            except asyncio.QueueFull:
                dead_queues.append(queue)
                logger.warning("Dropping slow SSE subscriber")
        for dq in dead_queues:
            self._queues.remove(dq)


broadcaster = EventBroadcaster()
