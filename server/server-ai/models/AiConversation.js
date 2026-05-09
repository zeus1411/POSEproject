import mongoose from 'mongoose';

const ALLOWED_AI_MODES = ['document_rag', 'catalog_qa'];

const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [8000, 'Message is too long']
    },
    mode: {
      type: String,
      enum: ALLOWED_AI_MODES,
      required: true
    },
    retrievalStrategy: {
      type: String,
      default: ''
    },
    sourceSummary: {
      type: String,
      default: ''
    },
    sources: [
      {
        title: String,
        uri: String,
        chunkId: String,
        score: Number
      }
    ]
  },
  {
    timestamps: true
  }
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    anonymousId: {
      type: String,
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    mode: {
      type: String,
      enum: ALLOWED_AI_MODES,
      default: 'document_rag'
    },
    messages: [aiMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      lastMode: {
        type: String,
        enum: ALLOWED_AI_MODES,
        default: 'document_rag'
      },
      lastRetrievalStrategy: {
        type: String,
        default: ''
      },
      lastSourceSummary: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

aiConversationSchema.index({ userId: 1, status: 1 });
aiConversationSchema.index({ anonymousId: 1, status: 1 });

aiConversationSchema.methods.addMessage = function (message) {
  this.messages.push(message);
  this.lastMessageAt = new Date();
  this.mode = message.mode;
  this.metadata.lastMode = message.mode;
  if (message.retrievalStrategy) {
    this.metadata.lastRetrievalStrategy = message.retrievalStrategy;
  }
  if (message.sourceSummary) {
    this.metadata.lastSourceSummary = message.sourceSummary;
  }
  return this;
};

const AiConversation = mongoose.model('AiConversation', aiConversationSchema);

export { ALLOWED_AI_MODES };
export default AiConversation;
