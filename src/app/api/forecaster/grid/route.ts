import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";
import { CarbonApiService } from "@/lib/forecaster/carbon-api";

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

    const carbonService = new CarbonApiService();
    const liveTelemetry = await carbonService.getLiveCarbonIntensity();

    const forecast = Array.from({ length: 24 }, (_, hour) => {
      const rad1 = (hour - 3) * (2 * Math.PI / 24);
      const rad2 = (hour - 13) * (2 * Math.PI / 24);
      
      const sinVal = Math.sin(rad1) * 0.45 + Math.sin(rad2 * 2) * 0.55;
      let intensity = Math.round(liveTelemetry.currentGco2 + sinVal * 120);
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

    return NextResponse.json({ 
      forecast, 
      bestHour, 
      averageIntensity,
      liveTelemetry
    });
  } catch (error: any) {
    console.error("Error fetching carbon forecast:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
