import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  maskedPreview: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  start: {
    type: Number
  },
  end: {
    type: Number
  }
}, { _id: false });

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  mode: {
    type: String,
    required: true,
    enum: ['leak-guard', 'scam-analyzer', 'policy-decoder', 'trust-auditor']
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  verdict: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  findings: [findingSchema],
  redactedText: {
    type: String,
    default: ''
  },
  recommendedActions: [{
    type: String
  }],
  extras: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiUnavailable: {
    type: Boolean,
    default: false
  },
  inputLength: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Enforce privacy: never store raw user input
export const Scan = mongoose.model('Scan', scanSchema);
