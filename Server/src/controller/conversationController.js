import { Conversation } from "../models/Conversation.model.js";
import { createError } from "../utils/errorUtils.js";
import { conversationCache } from "../utils/cacheUtils.js";

export const createConvo = async (req, res, next) => {
  try {
    const { participant } = req.body;
    const senderId = req.user._id;

    if (!participant || !senderId) {
      throw createError(400, "Participant ID is required");
    }

    const cacheKey = [senderId, participant].sort().join(":");
    const cachedConvo = conversationCache.get(cacheKey);

    if (cachedConvo) {
      return res.status(200).json({ conversationId: cachedConvo.data._id });
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        participants: { $all: [participant, senderId] },
      },
      {
        $setOnInsert: {
          participants: [senderId, participant],
          messages: [],
        },
      },
      {
        upsert: true,
        new: true,
        lean: true,
      }
    );
    conversationCache.set(cacheKey, conversation);
    res.status(201).json({ conversationId: conversation._id });
  } catch (error) {
    next(error);
  }
};
export const getConvoById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      throw createError(400, "Conversation ID is required");
    }

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username profilePic")
      .lean()
      .exec();
    if (!conversation) {
      throw createError(404, "Conversation not found");
    }

    //verify user is a participant
    if (
      !conversation.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      )
    ) {
      throw createError(
        403,
        "You are not authorized to view this conversation"
      );
    }
    return res.status(200).json(conversation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occured When fetching the conversation" });
  }
};

export const getUserConvos = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const cacheKey = `user:${userId}:convos:${page}:${limit}`;
    const cachedConvos = conversationCache.get(cacheKey);

    if (cachedConvos) {
      return res.status(200).json(cachedConvos.data);
    }

    if (!userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profilePic")
      .populate("lastMessage", "content createdAt")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    if (!conversations) {
      throw createError(404, "No conversations found");
    }

    const total = await Conversation.countDocuments({ participants: userId });
    const response = {
      conversations,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };

    // Set cache with response
    conversationCache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteConvo = async (req, res, next) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      throw createError(400, "Conversation ID is required");
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw createError(404, "Conversation not found");
    }

    // Verify user is participant
    if (!conversation.participants.includes(req.user._id)) {
      throw createError(403, "Not authorized to delete this conversation");
    }

    await Conversation.findByIdAndDelete(conversationId);

    // Clear from cache
    for (const [key, value] of conversationCache.entries()) {
      if (value.data._id.equals(conversationId)) {
        conversationCache.delete(key);
      }
    }

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    next(error);
  }
};
