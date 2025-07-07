// src/connxClient.ts
import { ConnexifyRTCClient } from '@connexify/core-sdk';

const client = new ConnexifyRTCClient(
  `peer-${crypto.randomUUID()}`,
  'http://localhost:3001'
);

export default client;
