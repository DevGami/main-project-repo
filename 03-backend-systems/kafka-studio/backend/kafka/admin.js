const { kafka } = require("./client");

// Singleton admin client to avoid opening/closing a connection on every call
let adminClient = null;
let adminConnected = false;

async function getAdmin() {
  if (!adminClient) {
    adminClient = kafka.admin();
  }
  if (!adminConnected) {
    await adminClient.connect();
    adminConnected = true;
  }
  return adminClient;
}

async function listTopics() {
  const admin = await getAdmin();
  const topicNames = await admin.listTopics();

  // Filter internal topics
  const userTopics = topicNames.filter(t => !t.startsWith('__'));
  if (userTopics.length === 0) return [];

  const metadata = await admin.fetchTopicMetadata({ topics: userTopics });
  return metadata.topics.map(t => ({
    name: t.name,
    partitions: t.partitions.map(p => ({
      id: p.partitionId,
      leader: p.leader,
      replicas: p.replicas.length,
    })),
  }));
}

async function createTopic(topic, numPartitions = 1) {
  const admin = await getAdmin();
  const existing = await admin.listTopics();

  if (existing.includes(topic)) {
    return { success: false, message: `Topic "${topic}" already exists` };
  }

  await admin.createTopics({
    topics: [{ topic, numPartitions, replicationFactor: 1 }],
  });
  return {
    success: true,
    message: `Topic "${topic}" created with ${numPartitions} partition(s)`,
    topic,
    numPartitions,
  };
}

async function deleteTopic(topicName) {
  const admin = await getAdmin();
  const existing = await admin.listTopics();
  if (!existing.includes(topicName)) {
    return { success: false, message: `Topic "${topicName}" not found` };
  }
  await admin.deleteTopics({ topics: [topicName] });
  return { success: true, message: `Topic "${topicName}" deleted` };
}

async function deleteAllTopics() {
  const admin = await getAdmin();
  const topicNames = await admin.listTopics();
  const toDelete = topicNames.filter(t => !t.startsWith('__'));
  if (toDelete.length > 0) {
    await admin.deleteTopics({ topics: toDelete });
  }
  return { success: true, deleted: toDelete };
}

module.exports = { listTopics, createTopic, deleteTopic, deleteAllTopics };
