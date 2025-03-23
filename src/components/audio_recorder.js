"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"


export function AudioRecorder({ isRecording, setIsRecording, onAudioCapture, disabled = false }) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef([])
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      stopRecording()
    }
  }, [isRecording])

  const startRecording = async () => {
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        onAudioCapture(audioBlob)

        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setPermissionDenied(false)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setPermissionDenied(true)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "default"}
        onClick={() => setIsRecording(!isRecording)}
        disabled={disabled || permissionDenied}
        className="flex items-center gap-2"
      >
        {isRecording ? (
          <>
            <Square className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Start Recording
          </>
        )}
      </Button>

      {permissionDenied && (
        <span className="text-sm text-destructive">
          Microphone access denied. Please enable it in your browser settings.
        </span>
      )}
    </div>
  )
}

