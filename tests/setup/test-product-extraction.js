const https = require('https');
const http = require('http');

async function testProductExtraction() {
  console.log('🧪 Testing Product Information Extraction\n');

  try {
    // Test with bypass auth to get mock data
    const response = await fetch('http://localhost:3003/api/billing/invoices?limit=5', {
      headers: {
        'X-Bypass-Auth': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📊 Invoice Data with Product Information:');
    console.log('==========================================');
    
    data.invoices.forEach((invoice, index) => {
      console.log(`\n${index + 1}. Invoice ${invoice.number}:`);
      console.log(`   Payment Date: ${new Date(invoice.created * 1000).toLocaleDateString()}`);
      console.log(`   Amount: $${(invoice.amount_paid / 100).toFixed(2)}`);
      console.log(`   Product: ${invoice.product || 'No product info'}`);
      console.log(`   Status: ${invoice.status}`);
      console.log(`   Description: ${invoice.description || 'No description'}`);
    });

    console.log('\n✅ Product extraction test completed!');
    console.log('\n📝 Expected Product Names:');
    console.log('- Xpeak Plus - Monthly');
    console.log('- Xpeak Pro - Quarterly');
    console.log('- Unknown Product (fallback)');

  } catch (error) {
    console.error('❌ Error testing product extraction:', error.message);
  }
}

// Use global fetch if available (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testProductExtraction(); 