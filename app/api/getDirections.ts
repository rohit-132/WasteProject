import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OLAMAPS_API_KEY || "-cfSjXs1Uk-bnEAgDb8gX5q";
    if (!apiKey) throw new Error("API key is missing");

    // Get parameters from URL or use defaults
    const origin = req.nextUrl.searchParams.get("origin") || "12.9352,77.6245"; // Default: Bengaluru
    const destination = req.nextUrl.searchParams.get("destination") || "12.9766,77.5993"; // Default: Different location in Bengaluru

    // Build proper URL with all required parameters
    const url = `https://api.olamaps.io/routing/v1/directions?origin=${origin}&destination=${destination}&api_key=${apiKey}`;
    
    console.log("Requesting directions from:", url);
    
    const response = await fetch(url, {
      method: "GET", // Changed to GET as this appears to be a GET endpoint
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      // Log the error response for debugging
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Fetch failed:", error); // Logs full error object

    // ✅ Explicitly check if it's an instance of Error
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ✅ Default fallback for non-standard errors
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
