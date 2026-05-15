import { NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT =
  "Extract all text from this image exactly as it appears. " +
  "For all mathematical expressions, equations, and formulas use LaTeX notation: " +
  "wrap inline math in $...$ and block/display equations in $$...$$. " +
  "For chemical equations use standard chemical notation. " +
  "Preserve the original question structure and numbering if present. " +
  "Return only the extracted text with no additional explanations or commentary.";

export async function POST(request) {
  const { imageBase64, mimeType } = await request.json();

  const url = `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
  };

  const geminiRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.json();
    return NextResponse.json(
      { error: err.error?.message ?? "Extraction failed" },
      { status: geminiRes.status }
    );
  }

  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return NextResponse.json({ text });
}
