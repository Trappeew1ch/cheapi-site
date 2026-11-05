import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1f16",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#d8ff6a",
            letterSpacing: "-12px",
            marginLeft: -10,
            marginTop: -6,
          }}
        >
          »
        </div>
      </div>
    ),
    { ...size },
  );
}
