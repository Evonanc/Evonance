const supabaseUrl = 'https://mwwsbmwttnbypeyhykdc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13d3NibXd0dG5ieXBleWh5a2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjQ2ODcsImV4cCI6MjA5NDg0MDY4N30.Z7yA1DBmz-E_enBDV7BdKEvLRCiefjKZ8E2-EZd52hk';

async function checkTable(tableName) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?limit=1`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  const text = await response.text();
  console.log(`Table ${tableName}: status: ${response.status}, msg: ${text}`);
}

async function checkSchema() {
  await checkTable('nonexistent_table_random_xyz');
}

checkSchema();
