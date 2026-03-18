// import { NextResponse } from "next/server"

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const company_id = searchParams.get("company_id")

//     if (!company_id) {
//       return NextResponse.json(
//         { status: false, message: "company_id is required" },
//         { status: 400 }
//       )
//     }

//     const res = await fetch(
//       `http://dyeing.undo.it/api/raw_yarn/list.php?company_id=${company_id}`,
//       {
//         method: "GET",
//         cache: "no-store",
//       }
//     )

//     const data = await res.json()

//     return NextResponse.json(data)

//   } catch (error) {
//     return NextResponse.json(
//       { status: false, message: "Failed to fetch yarn list" },
//       { status: 500 }
//     )
//   }
// }






// import { NextResponse } from "next/server"

// // export async function GET(request: Request) {
// //   try {
// //     const { searchParams } = new URL(request.url)
// //     const company_id = searchParams.get("company_id")

// //     if (!company_id) {
// //       return NextResponse.json(
// //         { status: false, message: "company_id is required" },
// //         { status: 400 }
// //       )
// //     }

// //     const res = await fetch(
// //       `http://dyeing.undo.it/api/raw_yarn/list.php?company_id=${company_id}`,
// //       {
// //         method: "GET",
// //         cache: "no-store",
// //       }
// //     )

// //     const data = await res.json()

// //     return NextResponse.json(data)

// //   } catch (error) {
// //     return NextResponse.json(
// //       { status: false, message: "Failed to fetch yarn list" },
// //       { status: 500 }
// //     )
// //   }
// // }

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const company_id = searchParams.get("company_id")

//     if (!company_id) {
//       return NextResponse.json(
//         { status: false, message: "company_id is required" },
//         { status: 400 }
//       )
//     }

//     // Determine if this is a total request
//     const path = searchParams.get("action")
//     let apiUrl = ""
//     if (path === "total") {
//       apiUrl = `http://dyeing.undo.it/api/raw_yarn/totalyarn.php?company_id=${company_id}`
//     } else {
//       apiUrl = `http://dyeing.undo.it/api/raw_yarn/list.php?company_id=${company_id}`
//     }

//     const res = await fetch(apiUrl, { method: "GET", cache: "no-store" })
//     const data = await res.json()
//     return NextResponse.json(data)

//   } catch (error) {
//     return NextResponse.json(
//       { status: false, message: "Failed to fetch yarn data" },
//       { status: 500 }
//     )
//   }
// }


// export async function PUT(request: Request) {
//   try {
//     const body = await request.json()

//     const res = await fetch(
//       "http://dyeing.undo.it/api/raw_yarn/update.php",
//       {
//         method: "POST", // PHP APIs usually accept POST
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       }
//     )

//     const data = await res.json()

//     return NextResponse.json(data)

//   } catch (error) {
//     return NextResponse.json(
//       { status: false, message: "Failed to update yarn" },
//       { status: 500 }
//     )
//   }
// }





// import { NextRequest, NextResponse } from 'next/server'

// // GET yarn entries
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const company_id = searchParams.get('company_id')
//     if (!company_id) {
//       return NextResponse.json({ status: false, message: 'company_id is required' }, { status: 400 })
//     }

//     const res = await fetch(`http://dyeing.undo.it/api/raw_yarn/list.php?company_id=${company_id}`)
//     const data = await res.json()
//     return NextResponse.json(data)
//   } catch (error) {
//     return NextResponse.json({ status: false, message: 'Failed to fetch entries' }, { status: 500 })
//   }
// }

// // POST or PUT yarn entry (add or update)
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json()
//     const isUpdate = !!body.id

//     const apiUrl = isUpdate
//       ? 'http://dyeing.undo.it/api/raw_yarn/update.php'
//       : 'http://dyeing.undo.it/api/raw_yarn/add.php' // assuming add API exists

//     const res = await fetch(apiUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     })

//     const data = await res.json()
//     return NextResponse.json(data)
//   } catch (error) {
//     return NextResponse.json({ status: false, message: 'Failed to save entry' }, { status: 500 })
//   }
// }

// // DELETE yarn entry
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')
//     if (!id) {
//       return NextResponse.json({ status: false, message: 'id is required' }, { status: 400 })
//     }

//     const res = await fetch(`http://dyeing.undo.it/api/raw_yarn/delete.php?id=${id}`, {
//       method: 'GET', // your delete API uses GET
//     })
//     const data = await res.json()
//     return NextResponse.json(data)
//   } catch (error) {
//     return NextResponse.json({ status: false, message: 'Failed to delete entry' }, { status: 500 })
//   }
// }








import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get('company_id')
    if (!company_id) {
      return NextResponse.json(
        { status: false, message: 'company_id is required' },
        { status: 400 }
      )
    }

    const action = searchParams.get('action') // optional: 'total' or undefined

    let apiUrl = ''
    if (action === 'total') {
      apiUrl = `http://dyeing.undo.it/api/raw_yarn/totalyarn.php?company_id=${company_id}`
    } else {
      apiUrl = `http://dyeing.undo.it/api/raw_yarn/list.php?company_id=${company_id}`
    }

    const res = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Failed to fetch yarn data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const isUpdate = !!body.id

    const apiUrl = isUpdate
      ? 'http://dyeing.undo.it/api/raw_yarn/update.php'
      : 'http://dyeing.undo.it/api/raw_yarn/add.php' // add API assumed

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Failed to save entry' },
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
      `http://dyeing.undo.it/api/raw_yarn/delete.php?id=${id}`,
      { method: 'GET' } // your delete API uses GET
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}