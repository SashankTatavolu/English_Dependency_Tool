const express = require('express');
const router = express.Router();
const Sentence = require('../models/Sentence');

// Upload tokens
router.post('/upload', async (req, res) => {
  const { lines } = req.body;

  const tokens = lines.map(line => {
    const [ID, FORM, LEMMA, UPOS, XPOS, FEATS, HEAD, DEPREL, DEPS, MISC] = line.split('\t');
    return {
      ID: parseInt(ID),
      FORM, LEMMA, UPOS, XPOS, FEATS,
      HEAD: parseInt(HEAD),
      DEPREL, DEPS, MISC
    };
  });

  const sentence = new Sentence({ tokens });
  await sentence.save();

  res.json(sentence);
});

// Get latest sentence
router.get('/latest', async (req, res) => {
  const sentence = await Sentence.findOne().sort({ _id: -1 });
  res.json(sentence);
});

// Update a token
router.put('/:sentenceId/token/:tokenId', async (req, res) => {
  const { sentenceId, tokenId } = req.params;
  const { HEAD, DEPREL } = req.body;

  const sentence = await Sentence.findById(sentenceId);
  const token = sentence.tokens.find(t => t.ID == tokenId);

  if (HEAD !== undefined) token.HEAD = parseInt(HEAD);
  if (DEPREL) token.DEPREL = DEPREL;

  await sentence.save();
  res.json(sentence);
});

module.exports = router;
