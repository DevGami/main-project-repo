const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { listTopics, createTopic, deleteTopic, deleteAllTopics } = require('./kafka/admin');
const { sendMessage, getStats } = require('./kafka/producer');
const { startConsumer, stopConsumer, stopAllConsumers, getConsumerList } = require('./kafka/consumer');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'DELETE'] },
});

const PORT = 3000;

// ── Topics ────────────────────────────────────────────────────────────────────

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await listTopics();
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const { topic, partitions } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic name is required' });
    }
    const result = await createTopic(topic.trim(), parseInt(partitions) || 1);
    if (result.success) {
      // Broadcast updated topic list to all clients
      const topics = await listTopics();
      io.emit('topic-update', topics);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/topics/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await deleteTopic(decodeURIComponent(name));
    if (result.success) {
      const topics = await listTopics();
      io.emit('topic-update', topics);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Producer ──────────────────────────────────────────────────────────────────

app.post('/api/produce', async (req, res) => {
  try {
    const { topic, partition, key, message } = req.body;
    if (!topic || !message) {
      return res.status(400).json({ success: false, error: 'Topic and message are required' });
    }
    const result = await sendMessage(topic, partition, key, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Consumers ─────────────────────────────────────────────────────────────────

app.get('/api/consumers', (req, res) => {
  res.json({ success: true, consumers: getConsumerList() });
});

app.post('/api/consumers/start', async (req, res) => {
  try {
    const { groupId, topics } = req.body;
    if (!groupId || !topics || !topics.length) {
      return res.status(400).json({ success: false, error: 'groupId and topics[] are required' });
    }
    const result = await startConsumer(groupId.trim(), topics, io);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/consumers/stop', async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ success: false, error: 'groupId is required' });
    const result = await stopConsumer(groupId, io);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Stats ──────────────────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const topics = await listTopics();
    const consumers = getConsumerList();
    const producerStats = getStats();
    res.json({
      success: true,
      topicCount: topics.length,
      consumerCount: consumers.length,
      totalMessagesSent: producerStats.totalMessagesSent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Reset ──────────────────────────────────────────────────────────────────────

app.post('/api/reset', async (req, res) => {
  try {
    await stopAllConsumers(io);
    const result = await deleteAllTopics();
    io.emit('topic-update', []);
    io.emit('consumer-update', []);
    res.json({ success: true, message: 'System reset', deletedTopics: result.deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── WebSocket ─────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state to newly connected client
  listTopics()
    .then(topics => socket.emit('topic-update', topics))
    .catch(() => {});
  socket.emit('consumer-update', getConsumerList());

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n🚀 Kafka Studio backend running on http://localhost:${PORT}\n`);
});
