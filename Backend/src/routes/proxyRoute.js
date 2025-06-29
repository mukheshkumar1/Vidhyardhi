// routes/proxyRoute.js
import express from "express";
import fetch from "node-fetch";
import { pipeline } from "stream";
import { promisify } from "util";

const router = express.Router();
const streamPipeline = promisify(pipeline);

router.get("/proxy-drive-image", async (req, res) => {
  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).send("Missing fileId");
  }

  try {
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok || !response.body) {
      return res.status(500).send("Failed to fetch image");
    }

    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");

    // ✅ Pipe response body to the client using pipeline
    await streamPipeline(response.body, res);
  } catch (error) {
    console.error("Proxy Error:", error.message);
    res.status(500).send("Image proxy failed");
  }
});

export default router;
