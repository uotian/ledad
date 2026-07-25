import type { Refs, SetError } from "../types";

export function commit(refs: Refs, setError: SetError) {
  const channel = refs.channel.current;
  let sent = false;
  if (channel?.readyState !== "open") {
    setError("Could not commit: the session is not listening.");
  } else {
    try {
      const eventId = `commit_${crypto.randomUUID()}`;
      setError(null);
      channel.send(JSON.stringify({ event_id: eventId, type: "input_audio_buffer.commit" }));
      sent = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(`Could not commit: ${message}`);
    }
  }
  return sent;
}
