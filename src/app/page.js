import { ChatInterface } from "@/components/chat_interface"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Scribe</h1>
        <ChatInterface />
      </div>
    </main>
  )
}

