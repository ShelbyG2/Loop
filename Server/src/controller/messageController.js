import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import socketService from "../services/Socket/index.socket.service.js";
import { notificationService } from "../services/notifications.service.js";

export const createMsg = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;
    if (!senderId || !receiverId || !content)
      return res.status(400).json({ message: "All fields are required!" });

    //Create a new conversation if not exists between sender and receiver
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const conversationId = conversation ? conversation._id : null;
    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content,
      isRead: false,
    });

    // Update conversation with the new message
    await Conversation.findOneAndUpdate(
      { participants: { $all: [senderId, receiverId] } },
      { $push: { messages: msg._id }, $set: { lastMessage: msg._id } },
      { new: true }
    );
    socketService.emitConversationUpdate(conversationId, {
      type: "NEW_MESSAGE",
      message: msg,
    });

    if (!socketService.onlineUsers.has(receiverId)) {
      await notificationService.createNotification(receiverId, "NEW_MESSAGE", {
        senderId,
        conversationId,
        messagePreview: content.substring(0, 20),
      });
    }

    return res.status(201).json(msg);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occured when sending your message " });
  }
};
export const deleteMsg = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId || !userId)
      return res.status(400).json({ message: "All fields are required!" });

    const msg = await Message.findById(messageId);
    if (!msg)
      return res.status(404).json({ message: "Message does not exist" });

    if (msg.sender.toString() !== userId.toString())
      return res
        .status(400)
        .json({ message: "Only sender can delete message!" });

    await Message.deleteOne({ _id: messageId });
    return res.status(200).json({ message: "Msage deeted successfully " });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occured when deleting your message " });
  }
};
export const getMsg = async (req, res) => {
  try {
    res.status(200).json(msg);
  } catch (error) {}
};
export const updateMsg = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId || !userId)
      return res.status(400).json({ message: "All fields are required!" });
    const msg = await Message.findById(messageId);
    if (!msg)
      return res.status(404).json({ message: "Message does not exist" });

    if (msg.sender.toString() !== userId.toString())
      return res
        .status(403)
        .json({ message: "Only sender can update message!" });

    const updatedMsg = await Message.findByIdAndUpdate(
      messageId,
      { content, isRead },
      { new: true, runValidatorsL: true }
    );
    return res.status(200).json(updateMsg);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred when updating your message",
      error: error.message,
    });
  }
};
