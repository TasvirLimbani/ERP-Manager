import { NextResponse } from "next/server";

// ✅ GET
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const company_id = searchParams.get("company_id");

    const res = await fetch(
      `http://dyeing.undo.it/api/stock/stock.php?company_id=${company_id}`
    );

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET ERROR:", error); // ✅ log error
    return NextResponse.json(
      { status: false, message: "API Error", error: error.message },
      { status: 500 }
    );
  }
}
