<div align="center">

# ⚡ Kafka Studio

**A real-time Kafka visualization dashboard for learning Kafka fundamentals.**

Built with Node.js · KafkaJS · React · TypeScript · Tailwind CSS v4 · Socket.IO · Docker

</div>

---

## What is this?

Kafka Studio is a self-hosted, interactive dashboard that lets you **see Apache Kafka in action** — in real time. Create topics with multiple partitions, start consumer groups, produce messages with or without keys, and watch exactly where each message lands.

**Core Kafka concepts you can visualize here:**
- 📦 **Topics & Partitions** — Create a topic with N partitions; see colored partition blocks in the UI
- 🔑 **Key-based Routing** — Messages with the same key ALWAYS land in the same partition (deterministic hashing)
- 🔄 **Round-Robin Distribution** — Messages without a key are load-balanced across all partitions
- 📡 **Pub/Sub Broadcast** — Every consumer group receives every message independently
- 📍 **Offsets** — Each message gets a sequential offset per partition, shown in the Live Stream
- 🛑 **Consumer Group Management** — Start and stop consumers, see their topic subscriptions and message counts

---

## Project Structure

```
Kafka-practice/
├── docker-compose.yml          # Zookeeper + Kafka containers
├── backend/
│   ├── server.js               # Express + Socket.IO REST API
│   └── kafka/
│       ├── client.js           # KafkaJS client singleton
│       ├── admin.js            # Topic management (create, delete, list)
│       ├── producer.js         # Message publishing
│       └── consumer.js         # Consumer group lifecycle
└── frontend/
    └── src/
        ├── App.tsx             # Main React application
        └── index.css           # Design system (Tailwind v4 + custom)
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Node.js](https://nodejs.org/) v18+
- npm v9+

---

## Quick Start

### 1. Start Kafka (Docker)

```bash
cd Kafka-practice
docker-compose up -d
```

> Wait ~30 seconds for Kafka to fully initialize after the containers start.

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:3000`.

### 3. Start the Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## How to Use & Verify

Follow this exact workflow to test all Kafka fundamentals:

### Experiment 1: Basic Pub/Sub

1. **Create a Topic** — In the Topics panel, type `events` and set Partitions to `3`, click **Create**.  
   You'll see 3 colored partition blocks (P0, P1, P2) appear under the topic name.

2. **Start Two Consumer Groups** — In the Consumers panel:
   - Group ID: `analytics`, topic: `events` → click **Start**
   - Group ID: `backup`, topic: `events` → click **Start**

3. **Publish a Message** — In the Message Producer:
   - Target Topic: `events`
   - Leave the Message Key **empty**
   - Click any Quick Template (e.g., "User Signup") then **Publish Message**

4. **What you'll see in the Live Stream:**
   - The **same message appears TWICE** — once with the `analytics` badge and once with the `backup` badge.
   - This is **pub/sub**: every consumer group independently receives every message.
   - The partition block for the matching partition lights up in the Topics panel.

---

### Experiment 2: Deterministic Key Routing

1. With your `events` topic still active, set the **Message Key** to `user-99`
2. Click **Publish Message** 5 times in a row
3. Look at the **P(n)** badge on each message in the Live Stream

**Expected**: All 5 messages with key `user-99` land on the **exact same partition** (e.g., all `P2`). The `@offset` number increments: `@0`, `@1`, `@2`, `@3`, `@4`.

4. Now change the key to `user-55` and publish 3 more times.
5. Notice these messages land on a **different** partition, but still all the same one for that key.

> This is how production Kafka guarantees ordering for related events (e.g., all events for one user are always processed in order).

---

### Experiment 3: Round-Robin (No Key)

1. Clear the Message Key field entirely
2. Publish 6 messages in a row
3. Watch the Live Stream — the partition badges will cycle: `P0`, `P1`, `P2`, `P0`, `P1`, `P2`

> Kafka distributes keyless messages evenly across all partitions for maximum throughput.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/topics` | List all topics with partition metadata |
| `POST` | `/api/topics` | Create a topic `{ topic, partitions }` |
| `DELETE` | `/api/topics/:name` | Delete a single topic |
| `POST` | `/api/produce` | Publish a message `{ topic, key?, message }` |
| `GET` | `/api/consumers` | List active consumer groups |
| `POST` | `/api/consumers/start` | Start a consumer `{ groupId, topics[] }` |
| `POST` | `/api/consumers/stop` | Stop a consumer `{ groupId }` |
| `GET` | `/api/stats` | Global stats (topics, consumers, messages sent) |
| `POST` | `/api/reset` | Stop all consumers and delete all topics |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Message Broker | Apache Kafka (via Confluent `cp-kafka:7.5.3`) |
| Coordination | Apache Zookeeper 3.7 |
| Backend Runtime | Node.js + Express 5 |
| Kafka Client | KafkaJS 2.x |
| Real-time | Socket.IO 4 |
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Icons | Lucide React |

---

## Troubleshooting

**"Disconnected" badge in the header?**  
The backend can't reach Kafka. Run `docker ps` — make sure both `kafka-practice-kafka-1` and `kafka-practice-zookeeper-1` are `Up`. If the Kafka container is `Exited`, run `docker-compose down -v && docker-compose up -d` to do a clean restart.

**Topic creation fails?**  
Kafka may still be initializing. Wait 30 seconds after `docker-compose up -d` before using the app.

**Messages not appearing in Live Stream?**  
Make sure you have at least one consumer group started and subscribed to the topic **before** publishing messages. Consumer groups with `fromBeginning: false` only receive messages produced **after** they connect.

**Frontend blank screen?**  
Open the browser console. If you see "Objects are not valid as a React child", the backend returned unexpected data — try the Reset All button in the header.