// Script to trigger local cron for testing
const fetch = require('node-fetch');

async function triggerCron() {
  console.log('Triggering Cron processor...');
  try {
    const res = await fetch('http://localhost:3000/api/cron/process', {
      headers: {
        'Authorization': 'Bearer ' + process.env.CRON_SECRET
      }
    });
    const data = await res.json();
    console.log('Cron Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error triggering cron:', err.message);
  }
}

triggerCron();
