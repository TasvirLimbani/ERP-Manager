import { NextResponse } from "next/server"

// ✅ GET
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const company_id = searchParams.get("company_id")

        const res = await fetch(`http://dyeing.undo.it/api/selling/list.php?company_id=${company_id}`)
        const data = await res.json()

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ status: false, message: "GET error" })
    }
}

// ✅ POST (ADD)
export async function POST(request: Request) {
    try {
        const body = await request.json()

        const res = await fetch("http://dyeing.undo.it/api/selling/add.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        const data = await res.json()
        return NextResponse.json(data)

    } catch (error) {
        return NextResponse.json({ status: false, message: "POST error" })
    }
}



