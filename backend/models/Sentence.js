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
  tokens: [tokenSchema]
});

// 👇 Make sure you're exporting correctly like this:
const Sentence = mongoose.model('Sentence', sentenceSchema);
module.exports = Sentence;
