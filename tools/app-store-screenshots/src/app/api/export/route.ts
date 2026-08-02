import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { imageData, locale, deviceType, sizeLabel, slideId, index } =
      await request.json();

    if (!imageData || !locale || !deviceType || !sizeLabel || !slideId || index == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const repoRoot = path.resolve(process.cwd(), "../..");
    const dir = path.join(
      repoRoot,
      "app_store",
      "screenshots",
      deviceType,
      locale,
      sizeLabel
    );

    await mkdir(dir, { recursive: true });

    const filename = `${index}-${slideId}.jpg`;
    const filePath = path.join(dir, filename);

    // Strip data URL prefix if present
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    await writeFile(filePath, Buffer.from(base64, "base64"));

    return NextResponse.json({ success: true, path: filePath });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
