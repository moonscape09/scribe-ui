import { NextResponse } from "next/server"

// This is a proxy endpoint to communicate with the FastAPI backend
// It helps avoid CORS issues when the frontend and backend are on different domains

export async function GET(request) {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8000"
    const response = await fetch(`${apiBaseUrl}/chats`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8000"

    const response = await fetch(`${apiBaseUrl}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving chat:", error)
    return NextResponse.json({ error: "Failed to save chat" }, { status: 500 })
  }
}

