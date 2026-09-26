type Options<Message> = {
  url: string;
  protocols?: string[];
  setup?: object;
  signal: AbortSignal;
  isReady: (message: Message) => boolean;
  getSocket: () => WebSocket | null;
  onMessage: (message: Message) => void;
  onError: (message: string) => void;
};

export async function connectSocket<Message extends { error?: { message?: string } }>(options: Options<Message>): Promise<WebSocket> {
  options.signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(options.url, options.protocols);
    socket.binaryType = "arraybuffer";
    let ready = false;
    let closed = false;
    const timeout = setTimeout(() => close("Realtime connection timed out."), 15000);
    const abort = () => close();
    options.signal.addEventListener("abort", abort, { once: true });

    socket.addEventListener("open", () => {
      if (!closed && options.setup) {
        try {
          socket.send(JSON.stringify(options.setup));
        } catch {
          close("Could not initialize the realtime connection.");
        }
      }
    });

    socket.addEventListener("message", (event: MessageEvent<string | ArrayBuffer>) => {
      if (!closed) {
        try {
          const data = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);
          const message = JSON.parse(data) as Message;
          if (ready) {
            if (socket === options.getSocket()) {
              if (message.error) close(message.error.message ?? "Realtime API error.");
              else options.onMessage(message);
            }
          } else if (message.error) {
            close(message.error.message ?? "Realtime connection failed.");
          } else if (options.isReady(message)) {
            ready = true;
            clearTimeout(timeout);
            resolve(socket);
          }
        } catch {
          close("Could not read speech event.");
        }
      }
    });
    socket.addEventListener("error", () => close("Realtime connection failed."));
    socket.addEventListener("close", () => close("Realtime connection closed. Please start again."));

    function close(message?: string) {
      if (!closed) {
        closed = true;
        clearTimeout(timeout);
        options.signal.removeEventListener("abort", abort);
        socket.close();
        if (!ready) {
          reject(message === undefined ? new DOMException("Session stopped.", "AbortError") : new Error(message));
        } else if (message !== undefined && socket === options.getSocket()) {
          options.onError(message);
        }
      }
    }
  });
}
