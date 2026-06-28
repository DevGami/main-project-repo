const { kafka } = require("./client");

// Map of groupId -> { consumer, topics, subscribedAt, messageCount }
const activeConsumers = {};

async function startConsumer(groupId, topics, io) {
  if (activeConsumers[groupId]) {
    return { success: false, message: `Consumer group "${groupId}" is already active` };
  }

  const consumer = kafka.consumer({ groupId });

  try {
    await consumer.connect();

    const topicArray = Array.isArray(topics) ? topics : [topics];
    for (const topic of topicArray) {
      // fromBeginning: false — only receive NEW messages, not historical replay
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    const meta = {
      consumer,
      topics: topicArray,
      subscribedAt: new Date().toISOString(),
      messageCount: 0,
    };
    activeConsumers[groupId] = meta;

    console.log(`Consumer group "${groupId}" started → topics: ${topicArray.join(', ')}`);

    // Emit the updated consumer list to all connected clients
    io.emit('consumer-update', getConsumerList());

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value ? message.value.toString() : '';
        const key = message.key ? message.key.toString() : '';
        const offset = message.offset;

        activeConsumers[groupId].messageCount++;

        console.log(`[${groupId}] ← ${topic}[${partition}]@${offset}: ${value.substring(0, 80)}`);

        io.emit('kafka-message', {
          groupId,
          topic,
          partition,
          key,
          value,
          offset,
          timestamp: new Date().toISOString(),
        });
      },
    });

    return { success: true, message: `Consumer group "${groupId}" started` };
  } catch (error) {
    console.error(`Error starting consumer "${groupId}":`, error);
    // Clean up on failure
    try { await consumer.disconnect(); } catch (_) { }
    return { success: false, error: error.message };
  }
}

async function stopConsumer(groupId, io) {
  const meta = activeConsumers[groupId];
  if (!meta) {
    return { success: false, message: `Consumer group "${groupId}" not found` };
  }
  try {
    await meta.consumer.disconnect();
  } catch (e) {
    console.error(`Error disconnecting consumer "${groupId}":`, e);
  }
  delete activeConsumers[groupId];
  if (io) io.emit('consumer-update', getConsumerList());
  return { success: true, message: `Consumer group "${groupId}" stopped` };
}

async function stopAllConsumers(io) {
  const groupIds = Object.keys(activeConsumers);
  for (const groupId of groupIds) {
    try {
      await activeConsumers[groupId].consumer.disconnect();
    } catch (e) {
      console.error(`Error stopping consumer "${groupId}":`, e);
    }
    delete activeConsumers[groupId];
  }
  if (io) io.emit('consumer-update', []);
  return { success: true, message: `Stopped ${groupIds.length} consumer(s)` };
}

function getConsumerList() {
  return Object.entries(activeConsumers).map(([groupId, meta]) => ({
    groupId,
    topics: meta.topics,
    subscribedAt: meta.subscribedAt,
    messageCount: meta.messageCount,
  }));
}

module.exports = { startConsumer, stopConsumer, stopAllConsumers, getConsumerList, activeConsumers };
