"use server"

import { revalidatePath } from "next/cache"

// Function to send audio to Scribe and get a response
export async function sendAudioToScribe(audioBlob, chatHistory) {
  try {
    // Convert audio blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

    // Format chat history for the AI model
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Prepare the request to the backend
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8000"
    const response = await fetch(`${apiBaseUrl}/process-audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: base64Audio,
        history: formattedHistory,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to process audio: ${response.statusText}`)
    }

    const result = await response.json()

    // Revalidate the path to ensure fresh data
    revalidatePath("/")

    return {
      transcription: result.transcription,
      response: result.response,
    }
  } catch (error) {
    console.error("Error sending audio to Scribe:", error)
    return {
      transcription: "Failed to transcribe audio",
      response: "Sorry, I encountered an error processing your request.",
    }
  }
}

