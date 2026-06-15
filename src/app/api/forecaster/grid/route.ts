import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(sessionCookie);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Double-sinusoidal forecast curve:
    // Peak hours: Morning (7-9 AM), Evening (6-9 PM) -> intensity rises to 450-520 gCO2/kWh
    // Clean hours: Midday solar peak (11 AM - 3 PM), Overnight wind peak (2-5 AM) -> intensity drops to 60-120 gCO2/kWh
    const forecast = Array.from({ length: 24 }, (_, hour) => {
      // Sinusoidal components for diurnal demand and solar shifts
      const rad1 = (hour - 3) * (2 * Math.PI / 24); // Trough at 3 AM
      const rad2 = (hour - 13) * (2 * Math.PI / 24); // Trough at 1 PM (solar peak)
      
      const sinVal = Math.sin(rad1) * 0.45 + Math.sin(rad2 * 2) * 0.55;
      // Map sinVal (-1 to 1) to intensity (50 to 520 gCO2/kWh)
      let intensity = Math.round(260 + sinVal * 200);
      intensity = Math.max(50, Math.min(550, intensity));

      let status: "clean" | "moderate" | "peak" = "moderate";
      if (intensity < 140) status = "clean";
      else if (intensity > 340) status = "peak";

      return { hour, intensity, status };
    });

    const intensities = forecast.map(f => f.intensity);
    const minIntensity = Math.min(...intensities);
    const bestHour = forecast.find(f => f.intensity === minIntensity)?.hour ?? 3;
    const averageIntensity = Math.round(intensities.reduce((a, b) => a + b, 0) / 24);

    return NextResponse.json({ forecast, bestHour, averageIntensity });
  } catch (error: any) {
    console.error("Error fetching carbon forecast:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
