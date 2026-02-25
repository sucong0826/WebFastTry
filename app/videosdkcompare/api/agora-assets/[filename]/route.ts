import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  if (!filename || !/^[a-zA-Z0-9_.-]+$/.test(filename) || !filename.endsWith(".wasm")) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "videosdkcompare-assets",
    "agora",
    filename
  );

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "content-type": "application/wasm",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
