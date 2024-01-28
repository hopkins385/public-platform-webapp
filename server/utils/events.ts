import { EventEmitter } from 'node:events';

export const event = new EventEmitter();

// listen for events
event.on('message', (msg) => {
  console.log('received message', msg);
});
