"use client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Load once from Local Storage when the page opens.
  // Local Storage is a small memory inside your browser.
  const [text, setText] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("note") : "";
    if (saved) setText(saved);
  }, []);

  const [status, setStatus] = useState("");

  function saveNote() {
    localStorage.setItem("note", text);
    setStatus(`Saved at ${new Date().toLocaleTimeString()}.`);
  }

  function clearNote() {
    localStorage.removeItem("note");
    setText("");
    setStatus("Note cleared.");
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Sticky Note</h1>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note here..."
        className="min-h-[300px] bg-yellow-100"
      />
      <div className="flex gap-2">
        <Button onClick={saveNote}>Save Note</Button>
        <Button variant="secondary" onClick={clearNote}>Clear</Button>
      </div>
      <p className="text-sm opacity-80">{status}</p>
    </main>
  );
}
