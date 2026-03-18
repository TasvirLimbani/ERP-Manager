import { NextResponse } from "next/server";

export async function GET() {
  try {

    const response = await fetch(
      "http://dyeing.undo.it/api/admin/dashboard.php?company_id=1",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({
      status: false,
      message: "Server error",
    });
  }
}