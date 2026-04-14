import pg from 'pg';
const { Client } = pg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_w5DnaiKCV0EP@54.209.204.248/neondb?sslmode=require&options=endpoint%3Dep-ancient-unit-am6by8o3-pooler',
  ssl: {
    rejectUnauthorized: false,
    servername: 'ep-ancient-unit-am6by8o3-pooler.c-5.us-east-1.aws.neon.tech'
  }
});

client.connect()
  .then(() => {
    console.log('Connected to Neon via IP bypass successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect:', err);
    process.exit(1);
  });
