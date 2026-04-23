const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = "AIzaSyA9s1iPzfxaJrzZ2hqKPlKBePWu4fM8as0";
const modelName = "gemini-1.5-flash";

async function testGemini() {
  console.log("--- TEST CONFIG ---");
  console.log("API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
  console.log("Model:", modelName);
  console.log("-------------------\n");

  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Listing models...");
    const modelsResult = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels?.();
    // (Note: listModels is not on the model instance, it's a bit different in genAI)
    
    console.log("Calling Gemini API with gemini-2.5-flash...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent("Create a JSON with field 'status' set to 'success'. Return ONLY JSON.");
    const response = await result.response;
    const text = response.text();
    
    console.log("\n--- AI RESPONSE ---");
    console.log(text);
    console.log("-------------------\n");
    
    if (text.trim().toUpperCase().includes("OK")) {
      console.log("SUCCESS: Gemini API is working correctly.");
    } else {
      console.log("WARNING: Unexpected response, but API called successfully.");
    }
  } catch (err) {
    console.error("\n--- API ERROR ---");
    console.error("Error Message:", err.message);
    console.error("-------------------\n");
  }
}

testGemini();
