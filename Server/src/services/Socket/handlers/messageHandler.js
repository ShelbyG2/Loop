export class MessageHandler {
  constructor(io, onlineUsers) {
    this.io = io;
    this.onlineUsers = onlineUsers;
  }
  handle(socket) {
    this.handleMessageSend(socket);
    this.handleMessageRead(socket);
  }
  handleMessageSend(socket) {
    socket.on("message:send", async (message) => {
      try {
        const receiverId = message.receiverId;
        const receiverSocketId = this.onlineUsers.get(receiverId);

        //send message to receiver if online
        if (receiverId.socketId) {
          this.io.to(receiverSocketId).emit("message:receive", message);
        }

        //Update Message for both participants
      } catch (error) {}
    });
  }
}
