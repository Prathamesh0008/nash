const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join", (conversationId) => {
      socket.join(conversationId);
    });

    // message broadcast (after API save)
    socket.on("sendMessage", ({ conversationId, message }) => {
      io.to(conversationId).emit("newMessage", message);
    });

    // ✅ typing indicator
    socket.on("typing", ({ conversationId, name }) => {
      socket.to(conversationId).emit("typing", { name });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("stopTyping");
    });

    // ✅ deleted message broadcast
    socket.on("messageDeleted", ({ conversationId, messageId }) => {
      io.to(conversationId).emit("messageDeleted", { messageId });
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => console.log(`> Ready on http://localhost:${port}`));
});
