import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'http://dyeing.undo.it/api/machines'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get('company_id')
    const machine_type = searchParams.get('machine_type')

    if (!company_id) {
      return NextResponse.json(
        { status: false, message: 'company_id is required' },
        { status: 400 }
      )
    }

    let url = `${BASE_URL}/list.php?company_id=${company_id}`

    // ✅ if machine_type is passed → use filter API
    if (machine_type) {
      url = `${BASE_URL}/filter.php?company_id=${company_id}&machine_type=${machine_type}`
    }

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Failed to fetch machines' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const isUpdate = !!body.id

    const apiUrl = isUpdate
      ? `${BASE_URL}/edit.php`
      : `${BASE_URL}/add.php`

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Failed to save machine' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { status: false, message: 'id is required' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${BASE_URL}/delete.php?id=${id}`
    )

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Failed to delete machine' },
      { status: 500 }
    )
  }
}