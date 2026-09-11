const amqp = require('amqplib');

async function startConsumer() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const ch = await conn.createChannel();
  
  await ch.assertExchange('tasks.dlx', 'fanout', { durable: true });
  await ch.assertQueue('tasks.dlq', { durable: true });
  await ch.bindQueue('tasks.dlq', 'tasks.dlx', '');

  await ch.assertQueue('tasks.primary', {
    durable: true,
    deadLetterExchange: 'tasks.dlx'
  });

  ch.consume('tasks.primary', async (msg) => {
    if (!msg) return;
    try {
      console.log('Processing message:', msg.content.toString());
      ch.ack(msg);
    } catch (err) {
      console.error('Task error, routing to DLX:', err);
      ch.nack(msg, false, false);
    }
  });
}
startConsumer();
