"use client"

import { useState, useEffect } from "react"
import { AutoStopRecorder } from "@/components/auto_stop_recorder.js"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash } from "lucide-react"
import { sendAudioToScribe } from "@/libs/actions.js"
import { saveChatToDatabase, fetchChatHistory } from "@/libs/api.js"

export function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [latestResponse, setLatestResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await fetchChatHistory()
        if (history && history.length > 0) {
          setMessages(history)

          // Find the latest AI response
          const latestAIMessage = [...history].reverse().find((msg) => msg.role === "assistant")

          if (latestAIMessage) {
            setLatestResponse(latestAIMessage.content)
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChatHistory()
  }, [])

  // Save messages to database whenever they change
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      saveChatToDatabase(messages).catch((error) => {
        console.error("Failed to save chat:", error)
      })
    }
  }, [messages, isLoading])

  const handleAudioCapture = async (audioBlob) => {
    try {
      setIsProcessing(true)

      // Send audio to backend for processing
      const { transcription, response } = await sendAudioToScribe(audioBlob, messages)

      // Create a new user message
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: transcription,
        timestamp: Date.now(),
      }

      // Add to messages array for context
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      // Update the response
      setLatestResponse(response)

      // Add AI response to messages for context
      const assistantMessage ={
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages([...updatedMessages, assistantMessage])
    } catch (error) {
      console.error("Error processing audio:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearChat = async () => {
    setMessages([])
    setLatestResponse("")
    try {
      await saveChatToDatabase([])
    } catch (error) {
      console.error("Failed to clear chat history:", error)
    }
  }

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Scribe's response - the only display element */}
      <div className="flex-1 p-4">
        <Card className="p-6 bg-secondary h-full overflow-y-auto">
          {isProcessing ? (
            <div className="text-center text-gray-500">Processing your speech and generating a response...</div>
          ) : latestResponse ? (
            <div>{latestResponse}</div>
          ) : (
            <div className="text-center text-gray-500">Click 'Start Recording' and speak to receive a response</div>
          )}
        </Card>
      </div>

      {/* Controls */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AutoStopRecorder
            onAudioCapture={handleAudioCapture}
            disabled={isProcessing}
            silenceThreshold={0.01}
            silenceTimeout={1500}
          />
        </div>

        <div className="flex items-center gap-2">
          {isProcessing && <span className="text-sm text-gray-500">Processing...</span>}

          <Button variant="destructive" size="icon" onClick={clearChat} disabled={isProcessing}>
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

