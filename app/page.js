"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabaseClient.js";
import Image from "next/image";


// Make a short title from the first line of the note
function firstLine(s) {
  const t = (s || "").trim();
  if (!t) return "Untitled";
  const line = t.split("\n")[0];
  return line.length > 40 ? line.slice(0, 40) + "…" : line;
}

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Load list on first load
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (!error) {
        setNotes(data || []);
        if ((data || []).length) setActiveId(data[0].id);
      }
      setLoading(false);
    })();
  }, []);

  // Load content when activeId changes
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("content")
        .eq("id", activeId)
        .maybeSingle();
      if (!error) setText(data?.content ?? "");
    })();
  }, [activeId]);

  async function refreshList() {
    const { data } = await supabase
      .from("notes")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    setNotes(data || []);
  }

  async function saveNote() {
    if (!activeId) return;
    const title = firstLine(text);
    const { error } = await supabase
      .from("notes")
      .upsert({
        id: activeId,
        title,
        content: text,
        updated_at: new Date().toISOString(),
      });
    setStatus(error ? "Save failed." : `Saved at ${new Date().toLocaleTimeString()}.`);
    await refreshList();
  }

  async function newNote() {
    const id = crypto.randomUUID();
    const starter = "";
    const { error } = await supabase.from("notes").insert({
      id,
      title: "Untitled",
      content: starter,
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      setActiveId(id);
      setText(starter);
      await refreshList();
      setStatus("New note created.");
    }
  }

  async function deleteNote() {
    if (!activeId) return;
    const id = activeId;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      const next = notes.filter((n) => n.id !== id);
      setNotes(next);
      setActiveId(next[0]?.id ?? null);
      setText("");
      setStatus("Note deleted.");
    }
  }

  // ⌘S / Ctrl+S quick save
  useEffect(() => {
    function onKey(e) {
      const cmdOrCtrl = e.metaKey || e.ctrlKey;
      if (cmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveNote();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text, activeId]);

  return (
    <main
      className="min-h-screen text-zinc-100
                 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black"
    >
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    {/* LOGO */}
    <Image
      src="/adclass-logo.png"   // if you don’t have this yet, use "/next.svg" to test
      alt="AdClass"
      width={32}
      height={32}
      priority
    />
    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
      Sticky Notes <span className="text-primary">AI</span>
    </h1>
  </div>

  <div className="hidden md:block">{/* spot for auth/settings later */}</div>
</div>


        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          {/* Sidebar list */}
          <aside
            className="rounded-2xl border border-zinc-800/60
                       bg-zinc-900/50 backdrop-blur-md p-3"
          >
            <div className="flex gap-2 mb-3">
              <Button onClick={newNote} className="shadow-lg">New note</Button>
            </div>

            {loading && <p className="text-sm opacity-70">Loading…</p>}

            <ul className="space-y-1">
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setActiveId(n.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition
                                hover:bg-zinc-800/80
                                ${n.id === activeId ? "bg-zinc-800" : ""}`}
                  >
                    <div className="text-sm font-medium">
                      {n.title || "Untitled"}
                    </div>
                    <div className="text-xs opacity-70">
                      {n.updated_at
                        ? new Date(n.updated_at).toLocaleString()
                        : ""}
                    </div>
                  </button>
                </li>
              ))}
              {notes.length === 0 && !loading && (
                <li className="text-sm opacity-70">
                  No notes yet. Click “New note”.
                </li>
              )}
            </ul>
          </aside>

          {/* Editor */}
          <section
            className="space-y-3 rounded-2xl border border-zinc-800/60
                       bg-zinc-900/50 backdrop-blur-md p-3"
          >
          <Textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Type your note here…"
  className="min-h-[300px] bg-transparent text-white placeholder:text-zinc-400"
  disabled={!activeId}
/>

            <div className="flex gap-2">
              <Button onClick={saveNote} disabled={!activeId} className="shadow-md">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={deleteNote}
                disabled={!activeId}
                className="border-zinc-700"
              >
                Delete
              </Button>
            </div>
            <p className="text-sm opacity-80">{status}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
