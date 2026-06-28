const { kafka, Partitioners } = require("./client");

let producer = null;
let totalMessagesSent = 0;

async function getProducer() {
  if (!producer) {
    producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
    await producer.connect();
    console.log("Kafka Producer connected");
  }
  return producer;
}

async function sendMessage(topic, partition, key, messageData) {
  const prod = await getProducer();

  // Avoid double-serialization: if the frontend sends a string (JSON text or plain text), use it directly.
  const value = typeof messageData === 'string' ? messageData : JSON.stringify(messageData);
  const msgKey = key && key.trim() !== '' ? key : null;

  const msgObj = { key: msgKey, value };
  if (partition !== undefined && partition !== null && partition >= 0) {
    msgObj.partition = Number(partition);
  }

  const result = await prod.send({
    topic,
    messages: [msgObj],
  });

  totalMessagesSent++;

  // result is an array of RecordMetadata objects
  const meta = result[0];
  return {
    success: true,
    message: "Message sent successfully",
    partition: meta.partition,
    offset: meta.baseOffset,
    topic: meta.topicName,
  };
}

function getStats() {
  return { totalMessagesSent };
}

module.exports = { sendMessage, getProducer, getStats };
