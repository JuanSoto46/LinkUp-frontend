/**
 * Explore page shows player + chat placeholders only.
 * WCAG 2.1.1 Keyboard operable: controls are focusable.
 */
export default function Explore() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <section className="md:col-span-2 border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Streaming player (preview)</h2>
        <div className="aspect-video border rounded-lg grid place-content-center">
          <span>Video player placeholder</span>
        </div>
      </section>
      <aside className="border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Chat (preview)</h2>
        <div className="h-64 overflow-auto border rounded p-2 mb-3" aria-live="polite" aria-atomic="false">
          <p>No messages yet.</p>
        </div>
        <form className="flex gap-2">
          <input className="border rounded px-3 py-2 flex-1" placeholder="Type a message" aria-label="Chat message"/>
          <button type="button" className="border rounded px-3 py-2">Send</button>
        </form>
      </aside>
    </div>
  );
}
