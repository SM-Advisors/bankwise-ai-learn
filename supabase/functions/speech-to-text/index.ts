import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY");
    if (!DEEPGRAM_API_KEY) {
      throw new Error("DEEPGRAM_API_KEY is not configured");
    }

    const contentType = req.headers.get("content-type") || "";

    // Expect raw audio blob
    if (!contentType.includes("audio/") && !contentType.includes("application/octet-stream") && !contentType.includes("multipart/form-data")) {
      // Try to handle JSON with base64
      const body = await req.json();
      if (!body.audio) {
        throw new Error("No audio data provided");
      }

      const audioBytes = Uint8Array.from(atob(body.audio), (c) => c.charCodeAt(0));

      const dgResponse = await fetch(
        "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${DEEPGRAM_API_KEY}`,
            "Content-Type": body.mimeType || "audio/webm",
          },
          body: audioBytes,
        }
      );

      if (!dgResponse.ok) {
        const errText = await dgResponse.text();
        throw new Error(`Deepgram API error [${dgResponse.status}]: ${errText}`);
      }

      const result = await dgResponse.json();
      const transcript =
        result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

      return new Response(JSON.stringify({ transcript }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Raw audio body
    const audioBuffer = await req.arrayBuffer();

    const dgResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": contentType.includes("audio/") ? contentType : "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      throw new Error(`Deepgram API error [${dgResponse.status}]: ${errText}`);
    }

    const result = await dgResponse.json();
    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Speech-to-text error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
