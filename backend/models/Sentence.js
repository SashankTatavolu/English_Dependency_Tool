const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  ID: Number,
  FORM: String,
  LEMMA: String,
  UPOS: String,
  XPOS: String,
  FEATS: String,
  HEAD: Number,
  DEPREL: String,
  DEPS: String,
  MISC: String
});

const sentenceSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  sent_id: String,
  text: String,  // Add this line
  tokens: [tokenSchema],
  feedback: String,
  // Add other fields you need
}, { timestamps: true });

// 👇 Make sure you're exporting correctly like this:
const Sentence = mongoose.model('Sentence', sentenceSchema);
module.exports = Sentence;
