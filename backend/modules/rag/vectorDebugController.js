/**
 * Vector Database Debug Controller
 * Test connection to Upstash Vector DB
 */

const axios = require("axios");

/**
 * Test Upstash Vector connection
 */
const testVectorConnection = async (req, res) => {
  try {
    const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL;
    let vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN;

    console.log("🔍 Testing Upstash Vector Connection...");
    console.log(`📡 URL: ${vectorUrl}`);

    if (!vectorUrl || !vectorToken) {
      return res.status(400).json({
        success: false,
        message: "Upstash Vector credentials not configured",
        has_url: !!vectorUrl,
        has_token: !!vectorToken,
      });
    }

    // Try to decode the token if it's base64
    let decodedToken = vectorToken;
    try {
      const decoded = Buffer.from(vectorToken, "base64").toString("utf-8");
      if (decoded.includes(":") || decoded.length < vectorToken.length) {
        decodedToken = decoded;
        console.log(
          `🔐 Token appears to be base64-encoded, decoded to: ${decodedToken.substring(0, 30)}...`,
        );
      }
    } catch (e) {
      console.log(`🔐 Token is not base64, using as-is`);
    }

    // Test 1: Try with Bearer token
    console.log("\n✅ Test 1: Info Command (Bearer Token)");
    try {
      const infoResponse = await axios.post(
        `${vectorUrl}/info`,
        {},
        {
          headers: {
            Authorization: `Bearer ${vectorToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("✅ Info response:", infoResponse.data);
      return res.json({
        success: true,
        message: "Vector connection test completed",
        method: "Bearer Token",
        url: vectorUrl,
        info: infoResponse.data,
      });
    } catch (bearerError) {
      console.error(
        "❌ Bearer token failed:",
        bearerError.response?.data || bearerError.message,
      );
    }

    // Test 2: Try with Basic auth (if token is base64)
    if (decodedToken !== vectorToken) {
      console.log("\n✅ Test 2: Info Command (Basic Auth)");
      try {
        const basicAuth = Buffer.from(decodedToken).toString("base64");
        const infoResponse = await axios.post(
          `${vectorUrl}/info`,
          {},
          {
            headers: {
              Authorization: `Basic ${basicAuth}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("✅ Info response:", infoResponse.data);
        return res.json({
          success: true,
          message: "Vector connection test completed",
          method: "Basic Auth",
          url: vectorUrl,
          info: infoResponse.data,
          note: "Token was base64-encoded credentials",
        });
      } catch (basicError) {
        console.error(
          "❌ Basic auth failed:",
          basicError.response?.data || basicError.message,
        );
      }
    }

    // Test 3: Try direct token as auth
    console.log("\n✅ Test 3: Info Command (Direct Token)");
    try {
      const infoResponse = await axios.post(
        `${vectorUrl}/info`,
        {},
        {
          headers: {
            Authorization: decodedToken,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("✅ Info response:", infoResponse.data);
      return res.json({
        success: true,
        message: "Vector connection test completed",
        method: "Direct Token",
        url: vectorUrl,
        info: infoResponse.data,
      });
    } catch (directError) {
      console.error(
        "❌ Direct token failed:",
        directError.response?.data || directError.message,
      );
    }

    return res.json({
      success: false,
      message: "All auth methods failed",
      url: vectorUrl,
      tokenFormat: vectorToken.substring(0, 20) + "...",
      attempts: [
        "Bearer Token - Failed",
        decodedToken !== vectorToken
          ? "Basic Auth - Failed"
          : "Basic Auth - Skipped",
        "Direct Token - Failed",
      ],
      suggestion:
        "Check Upstash console for correct auth format. Token might be base64-encoded username:password",
    });
  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message,
    });
  }
};

/**
 * Test Upstash Vector upsert with minimal payload
 */
const testUpsert = async (req, res) => {
  try {
    const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL;
    let vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN;

    console.log("🔍 Testing Upstash Vector Upsert...");

    if (!vectorUrl || !vectorToken) {
      return res.status(400).json({
        success: false,
        message: "Upstash Vector credentials not configured",
      });
    }

    // Create a minimal 1536-dim vector
    const embedding = [];
    for (let i = 0; i < 1536; i++) {
      embedding.push(Math.random() * 0.5 - 0.25); // Random values between -0.25 and 0.25
    }

    // Upstash Vector expects an ARRAY directly with { id, vector, metadata? }
    const payload = [
      {
        id: `test-vector-${Date.now()}`,
        vector: embedding,
        metadata: {
          userId: "test",
          dataType: "test",
        },
      },
    ];

    console.log(
      `📦 Test payload size: ${JSON.stringify(payload).length} bytes`,
    );
    console.log(`✅ Vector dimensions: ${embedding.length}`);
    console.log(`✅ Sample values (first 5): ${embedding.slice(0, 5)}`);

    const response = await axios.post(`${vectorUrl}/upsert`, payload, {
      headers: {
        Authorization: `Bearer ${vectorToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Upsert successful!");
    return res.json({
      success: true,
      message: "Vector upsert test completed",
      vector_id: payload[0].id,
      dimensions: embedding.length,
      payload_size: JSON.stringify(payload).length,
      response: response.data,
    });
  } catch (error) {
    console.error("Upsert error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Upsert test failed",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  testVectorConnection,
  testUpsert,
};
