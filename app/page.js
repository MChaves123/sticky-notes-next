"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabaseClient.js";

const NOTE_ID = "my-note"; // one shared note for now

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  // Load once from Supabase
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", NOTE_ID)
        .maybeSingle();

      if (error) {
        setStatus("Could not load note.");
        return;
      }
      if (data) setText(data.content ?? "");
    }
    load();
  }, []);

  // Save to Supabase (insert or update)
  async function saveNote() {
    const { error } = await supabase
      .from("notes")
      .upsert({
        id: NOTE_ID,
        content: text,
        updated_at: new Date().toISOString(),
      });

    setStatus(error ? "Save failed." : `Saved at ${new Date().toLocaleTimeString()}.`);
  }

  // Clear the note from Supabase
  async function clearNote() {
    const { error } = await supabase.from("notes").delete().eq("id", NOTE_ID);
    if (!error) {
      setText("");
      setStatus("Note cleared.");
    }
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
