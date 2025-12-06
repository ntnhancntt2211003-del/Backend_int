import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deletedBySender: {
      type: Boolean,
      default: false,
    },
    deletedByReceiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient conversation queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Populate user details when querying
messageSchema.pre(/^find/, function () {
  if (this.options._recursed) {
    return;
  }
  this.populate({
    path: "sender",
    select: "username avatar email",
  }).populate({
    path: "receiver",
    select: "username avatar email",
  });
});

export default mongoose.model("Message", messageSchema);
