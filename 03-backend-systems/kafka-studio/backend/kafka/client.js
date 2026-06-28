const { Kafka, Partitioners } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafka-studio",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

module.exports = { kafka, Partitioners };
