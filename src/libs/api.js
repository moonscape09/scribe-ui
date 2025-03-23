// API functions to interact with the FastAPI backend

// The base URL for the FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// Function to save chat history to the database
export async function saveChatToDatabase(messages) {
  try {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save chat: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving chat to database:", error)
    throw error
  }
}

// Function to fetch chat history from the database
export async function fetchChatHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching chat history:", error)
    // Return empty array instead of throwing to handle gracefully
    return []
  }
}

