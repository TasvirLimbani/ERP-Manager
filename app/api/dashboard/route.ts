import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
      const company_id = req.nextUrl.searchParams.get("company_id")

    if (!company_id) {
      return NextResponse.json(
        { status: false, message: "company_id is required" },
        { status: 400 }
      )
    }

  try {

    const response = await fetch(
      `http://dyeing.undo.it/api/admin/dashboard.php?company_id=${company_id}`,
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