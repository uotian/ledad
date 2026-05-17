import type { Refs } from "./types";

export function cleanup({ mic, connection, channel }: Refs) {
  channel.current?.close();
  channel.current = null;

  connection.current?.getSenders().forEach((sender) => sender.track?.stop());
  connection.current?.close();
  connection.current = null;

  mic.current?.getTracks().forEach((track) => track.stop());
  mic.current = null;
}
