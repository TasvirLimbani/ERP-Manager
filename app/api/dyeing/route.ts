import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")

    if (!company_id) {
      return NextResponse.json(
        { status: false, message: "company_id is required" },
        { status: 400 }
      )
    }

    const action = searchParams.get("action") // optional

    let apiUrl = ""

    if (action === "total") {
      apiUrl = `http://dyeing.undo.it/api/dyeing/totaldyeing.php?company_id=${company_id}`
    } else {
      apiUrl = `http://dyeing.undo.it/api/dyeing/list.php?company_id=${company_id}`
    }

    const res = await fetch(apiUrl, {
      method: "GET",
      cache: "no-store",
    })

    const data = await res.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { status: false, message: "Failed to fetch dyeing data" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // if id exists → update
    const apiUrl = body.id
      ? "http://dyeing.undo.it/api/dyeing/update.php"
      : "http://dyeing.undo.it/api/dyeing/add.php";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { status: false, message: "API Error", error },
      { status: 500 }
    );
  }
}



export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { status: false, message: "id is required" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `http://dyeing.undo.it/api/dyeing/delete.php`,
      {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await res.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { status: false, message: "Failed to delete entry" },
      { status: 500 }
    )
  }
}