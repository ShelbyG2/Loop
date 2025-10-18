import { Conversation } from "../models/Conversation.model.js";

export const createConvo = async (req, res) => {
  try {
    const { participant } = req.body;
    const senderId = req.user._id;

    if ((!participant, !senderId)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingConversation = await Conversation.findOne({
      participants: { $all: [participant, senderId] },
    });
    if (existingConversation) {
      return res.status(200).json({ conversationId: existingConversation._id });
    }
    const newConversation = await Conversation.create({
      participants: [senderId, participant],
      messages: [],
    });
    res.status(201).json({ conversationId: newConversation._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};
export const getConvoById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId)
      return res.status(400).json({ message: "All fields are required" });

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "username profilePic"
    );
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    return res.status(200).json(conversation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occured When fetching the conversation" });
    console.log(error);
  }
};

export const getUserConvos = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profilePic")
      .populate("lastMessage", "content  createdAt");
    if (!conversations)
      return res.status(404).json({ message: "no conversations found" });

    return res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
    console.log(error.message);
  }
};
export const updateConvo = async () => {};
export const deleteConvo = async (req, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId)
      return res.status(400).json({ message: "Conversation ID is required" });

    await Conversation.findByIdAndDelete(conversationId);
    return res
      .status(200)
      .json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};
