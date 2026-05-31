import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const imageData = fs.readFileSync(
    path.join(process.cwd(), "public/apple-icon.png")
  );
  const base64 = `data:image/png;base64,${imageData.toString("base64")}`;

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        src={base64}
        width={180}
        height={180}
        style={{ objectFit: "contain" }}
      />
    ),
    { ...size }
  );
}
