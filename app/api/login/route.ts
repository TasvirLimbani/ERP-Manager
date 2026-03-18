import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("http://dyeing.undo.it/api/auth/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      })
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Server error"
    });
  }
}