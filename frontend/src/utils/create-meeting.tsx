export function createMeetingRoom(peerId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("ws://localhost:8000/mediasoup");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "createRoom", data: { peerId } }));
    };

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === "roomCreated") {
        const { roomId } = data;
        ws.close();
        resolve(roomId);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    };

    ws.onclose = () => {
      reject(new Error("WebSocket closed before room ID was received"));
    };
  });
}