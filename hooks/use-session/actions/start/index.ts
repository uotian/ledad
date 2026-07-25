import { exchangeSDP } from "@/lib/transcript";
import type { Lang } from "@/lib/types";
import type { ItemLastRef, Langs, Refs, SetError, SetItems, SetStatus } from "../../types";
import { cleanup } from "../../utils";
import { onMessage } from "./on-message";

export async function start({ refs, langs, setStatus, setError, setItems, itemLast }: { refs: Refs; langs: Langs; setStatus: SetStatus; setError: SetError; setItems: SetItems; itemLast: ItemLastRef }) {
  itemLast.current = null;
  setStatus("requesting");
  setError(null);
  try {
    const mic = await setupMic(refs.mic);
    setStatus("connecting");
    const connection = setupConnection(refs.connection, mic);
    const channel = setupChannel(refs, connection);
    channel.addEventListener("open", () => { if (refs.channel.current === channel) setStatus("listening"); });
    channel.addEventListener("message", (message) => { if (refs.channel.current === channel) onMessage(message, langs, itemLast, setError, setItems); });
    channel.addEventListener("error", () => { if (refs.channel.current === channel) setError("Connection error. Please start again."); });
    await connect(connection, langs.from);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    cleanup(refs);
    setStatus("idle");
    setError(`Could not start: ${message}`);
  }
}

async function setupMic(micRef: Refs["mic"]) {
  const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  micRef.current = mic;
  return mic;
}

function setupConnection(connectionRef: Refs["connection"], mic: MediaStream) {
  const connection = new RTCPeerConnection();
  mic.getAudioTracks().forEach((track) => connection.addTrack(track, mic));
  connectionRef.current = connection;
  return connection;
}

function setupChannel(refs: Refs, connection: RTCPeerConnection) {
  const channel = connection.createDataChannel("oai-events");
  refs.channel.current = channel;
  return channel;
}

async function connect(connection: RTCPeerConnection, langFrom: Lang) {
  const offer = await connection.createOffer();
  if (!offer.sdp) throw new Error("Could not create SDP for Realtime connection.");
  await connection.setLocalDescription(offer);
  const answer = await exchangeSDP({ langFrom, sdp: offer.sdp });
  await connection.setRemoteDescription({ type: "answer", sdp: answer });
}
