import { FormEvent, useState } from "react";
import { api } from "../lib/api";

export default function CreateMeeting() {
  const [title,setTitle]=useState(""); const [scheduledAt,setScheduledAt]=useState(""); const [description,setDescription]=useState("");
  const [id,setId]=useState<string|null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api.createMeeting({ title, scheduledAt, description });
    setId(res.id);
  }

  return (
    <div className="max-w-md grid gap-3">
      <h1 className="text-xl font-semibold">Create meeting</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required/>
        <input className="border rounded px-3 py-2" type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} />
        <textarea className="border rounded px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)}/>
        <button className="border rounded px-3 py-2">Create</button>
      </form>
      {id && <p>Meeting created with id: <strong>{id}</strong></p>}
    </div>
  );
}
