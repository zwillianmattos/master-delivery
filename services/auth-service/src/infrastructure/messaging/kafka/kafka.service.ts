import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer, EachMessageHandler } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'auth-service',
      brokers: ['localhost:9092'], // Configure via env
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'auth-service-group' });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    
    // Subscribe to relevant topics
    await this.consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Handle incoming messages
        console.log({
          topic,
          partition,
          value: message.value?.toString(),
        });
      },
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async emitUserEvent(event: string, data: any) {
    await this.producer.send({
      topic: 'user-events',
      messages: [
        {
          key: event,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async subscribe(topic: string, groupId: string, handler: EachMessageHandler) {
    await this.consumer.subscribe({ topic, fromBeginning: true });
    await this.consumer.run({ eachMessage: handler });
  }
}
