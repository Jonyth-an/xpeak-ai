// Simple test to check if the API endpoint is working
async function testSimpleAPI() {
  console.log("Testing simple API call...");
  
  try {
    const response = await fetch("http://localhost:3000/api/word-maze/words?limit=1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Bypass-Auth": "true" // Enable test mode
      },
    });

    console.log("Response status:", response.status);
    const result = await response.text();
    console.log("Response body:", result);

    if (response.ok) {
      console.log("✅ Simple API test passed!");
    } else {
      console.log("❌ Simple API test failed!");
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

testSimpleAPI();
