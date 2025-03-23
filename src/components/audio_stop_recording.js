"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

export function AutoStopRecorder({
  onAudioCapture,
  disabled = false,
  silenceThreshold = 0.01, // Default threshold
  silenceTimeout = 2000, // Default 2 seconds of silence before stopping
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioChunksRef = useRef([])
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      stopRecording()
    }
  }, [])

  const startRecording = async () => {
    try {
      audioChunksRef.current = []

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context and analyser for silence detection
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        onAudioCapture(audioBlob)

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error)
          audioContextRef.current = null
        }

        analyserRef.current = null
      }

      // Start recording
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setPermissionDenied(false)

      // Start silence detection
      detectSilence()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setPermissionDenied(true)
    }
  }

  const stopRecording = () => {
    // Clear silence timer if it exists
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    setIsRecording(false)
  }

  const detectSilence = () => {
    if (!analyserRef.current || !isRecording) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkSilence = () => {
      if (!analyserRef.current || !isRecording) return

      analyserRef.current.getByteFrequencyData(dataArray)

      // Calculate average volume level
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength / 255 // Normalize to 0-1

      // If below threshold, start silence timer
      if (average < silenceThreshold) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            console.log("Silence detected, stopping recording")
            stopRecording()
          }, silenceTimeout)
        }
      } else {
        // If above threshold, clear silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      }

      // Continue checking if still recording
      if (isRecording) {
        requestAnimationFrame(checkSilence)
      }
    }

    // Start checking
    checkSilence()
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? stopRecording : startRecording}
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

      {isRecording && (
        <span className="text-sm text-green-500 animate-pulse">
          Recording... (will stop automatically after silence)
        </span>
      )}
    </div>
  )
}

