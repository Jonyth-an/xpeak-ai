// Basic API test that does not require user authentication
async function testBasicAPI() {
  console.log("Testing basic API functionality...");
  
  try {
    // Test 1: Test the /api/test endpoint
    console.log("\n1. Testing /api/test endpoint...");
    const testResponse = await fetch("http://localhost:3000/api/test");
    console.log("Test endpoint status:", testResponse.status);
    const testResult = await testResponse.json();
    console.log("Test endpoint result:", testResult);

    // Test 2: Test word addition with test mode
    console.log("\n2. Testing word addition with test mode...");
    const addResponse = await fetch("http://localhost:3000/api/word-maze/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Bypass-Auth": "true"
      },
      body: JSON.stringify({ 
        words: ["hello", "world"] 
      }),
    });

    console.log("Add words status:", addResponse.status);
    const addResult = await addResponse.json();
    console.log("Add words result:", JSON.stringify(addResult, null, 2));

    // Test 3: Test word retrieval with test mode
    console.log("\n3. Testing word retrieval with test mode...");
    const getResponse = await fetch("http://localhost:3000/api/word-maze/words?limit=5", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Bypass-Auth": "true"
      },
    });

    console.log("Get words status:", getResponse.status);
    const getResult = await getResponse.json();
    console.log("Get words result:", JSON.stringify(getResult, null, 2));

    console.log("\n✅ Basic API test completed!");
    
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

testBasicAPI();
