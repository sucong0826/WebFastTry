import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  if (!filename || !/^[a-zA-Z0-9_.-]+$/.test(filename) || !filename.endsWith(".mp4")) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "videosdkcompare-assets",
    "zoom",
    filename
  );

  try {
    const fileBuffer = await fs.readFile(filePath);
    const range = request.headers.get("range");

    if (!range) {
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "content-type": "video/mp4",
          "accept-ranges": "bytes",
          "content-length": String(fileBuffer.length),
          "cache-control": "public, max-age=3600",
        },
      });
    }

    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
      return new Response(null, { status: 416 });
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : fileBuffer.length - 1;

    if (start >= fileBuffer.length || end >= fileBuffer.length || start > end) {
      return new Response(null, { status: 416 });
    }

    const chunk = fileBuffer.subarray(start, end + 1);
    return new Response(chunk, {
      status: 206,
      headers: {
        "content-type": "video/mp4",
        "accept-ranges": "bytes",
        "content-range": `bytes ${start}-${end}/${fileBuffer.length}`,
        "content-length": String(chunk.length),
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
