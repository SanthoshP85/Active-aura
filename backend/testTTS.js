/**
 * TTS Model Test Script
 * Tests various HuggingFace TTS models to find working ones
 *
 * Run with: node testTTS.js
 * Or use the /test-tts endpoint
 */

require("dotenv").config();
const axios = require("axios");
const dns = require("dns");
const express = require("express");

// Force IPv4 resolution to fix ENOTFOUND issues
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3099;

// TTS Models to test
const TTS_MODELS = [
  "suno/bark-small",
  "facebook/mms-tts-eng",
  "microsoft/speecht5_tts",
  "espnet/kan-bayashi_ljspeech_vits",
  "facebook/fastspeech2-en-ljspeech",
];

// Test a single TTS model
async function testTTSModel(model, text = "Hello world, this is a test.") {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    console.error(
      "❌ No HuggingFace token found! Set HF_TOKEN or HUGGINGFACE_API_KEY",
    );
    return { model, success: false, error: "No token" };
  }

  console.log(`\n🔊 Testing model: ${model}`);
  console.log(`   Text: "${text}"`);

  try {
    const startTime = Date.now();

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 60000, // 60 second timeout
      },
    );

    const elapsed = Date.now() - startTime;
    const audioSize = response.data.length;
    const contentType = response.headers["content-type"];

    console.log(`   ✅ SUCCESS!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Audio Size: ${audioSize} bytes`);
    console.log(`   Time: ${elapsed}ms`);

    return {
      model,
      success: true,
      status: response.status,
      contentType,
      audioSize,
      elapsed,
    };
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data
      ? Buffer.from(error.response.data).toString()
      : error.message;

    console.log(`   ❌ FAILED`);
    console.log(`   Status: ${status || "N/A"}`);
    console.log(`   Error: ${errorData.substring(0, 200)}`);

    // Check if model is loading
    if (status === 503) {
      console.log(`   ⏳ Model is loading... try again in a few seconds`);
    }

    return {
      model,
      success: false,
      status,
      error: errorData.substring(0, 200),
    };
  }
}

// Test all models
async function testAllModels() {
  console.log("=".repeat(60));
  console.log("🔊 TTS MODEL TEST - Testing HuggingFace TTS Models");
  console.log("=".repeat(60));
  console.log(`Token: ${process.env.HF_TOKEN ? "✅ Found" : "❌ Missing"}`);

  const results = [];

  for (const model of TTS_MODELS) {
    const result = await testTTSModel(model);
    results.push(result);

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESULTS SUMMARY");
  console.log("=".repeat(60));

  const working = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Working Models (${working.length}):`);
  working.forEach((r) => {
    console.log(`   - ${r.model} (${r.audioSize} bytes, ${r.elapsed}ms)`);
  });

  console.log(`\n❌ Failed Models (${failed.length}):`);
  failed.forEach((r) => {
    console.log(`   - ${r.model}: ${r.error?.substring(0, 50)}...`);
  });

  return results;
}

// Express endpoints
app.get("/test-tts", async (req, res) => {
  const model = req.query.model || "suno/bark-small";
  const text = req.query.text || "Hello world";

  try {
    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    console.log(`\n[TEST-TTS] Testing model: ${model}`);
    console.log(`[TEST-TTS] Text: "${text}"`);
    console.log(`[TEST-TTS] Token: ${token ? "Present" : "Missing"}`);

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      },
    );

    console.log(`[TEST-TTS] Status: ${response.status}`);
    console.log(`[TEST-TTS] Content-Type: ${response.headers["content-type"]}`);
    console.log(`[TEST-TTS] Size: ${response.data.length} bytes`);

    res.json({
      success: true,
      model,
      status: response.status,
      contentType: response.headers["content-type"],
      audioSize: response.data.length,
      message: "TTS model works!",
    });
  } catch (e) {
    const status = e.response?.status;
    const errorData = e.response?.data
      ? Buffer.from(e.response.data).toString()
      : e.message;

    console.error(`[TEST-TTS] Error Status: ${status}`);
    console.error(`[TEST-TTS] Error: ${errorData}`);

    res.status(status || 500).json({
      success: false,
      model,
      status,
      error: errorData,
      message: e.message,
    });
  }
});

app.get("/test-tts-all", async (req, res) => {
  console.log("\n[TEST-TTS-ALL] Testing all TTS models...");
  const results = await testAllModels();

  res.json({
    total: results.length,
    working: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  });
});

app.get("/test-tts-audio", async (req, res) => {
  const model = req.query.model || "suno/bark-small";
  const text = req.query.text || "Hello, I am Aura, your fitness assistant!";

  try {
    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      },
    );

    // Return actual audio
    res.set({
      "Content-Type": response.headers["content-type"] || "audio/wav",
      "Content-Length": response.data.length,
    });
    res.send(Buffer.from(response.data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Run as script or server
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--server")) {
    // Start server mode
    app.listen(PORT, () => {
      console.log(`\n🚀 TTS Test Server running on http://localhost:${PORT}`);
      console.log(`\nEndpoints:`);
      console.log(`  GET /test-tts?model=suno/bark-small&text=Hello`);
      console.log(`  GET /test-tts-all`);
      console.log(`  GET /test-tts-audio?model=suno/bark-small&text=Hello`);
    });
  } else {
    // Run tests directly
    testAllModels().then(() => {
      console.log("\n✅ Test complete!");
      process.exit(0);
    });
  }
}

module.exports = { testTTSModel, testAllModels, app };
