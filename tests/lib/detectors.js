'use strict';
const { stripQuoted, countWords, splitSentences } = require('./text');

const CONVERSATION = 'conversation-prose';
const DOCUMENTATION = 'documentation-prose';
const BOTH = [CONVERSATION, DOCUMENTATION];

const SENTENCE_CAP = 25;

function matchCount(text, re) {
  const found = text.match(re);
  return found ? found.length : 0;
}

const DATE = /\b(?:\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/g;
const DECISION_VERB = /\b(?:decided|decide|set by|set that|set the|confirmed|agreed|chose|approved|signed off)\b/i;
const DECISION_WINDOW = 60;

// A date is only a violation when it records who decided something. A release
// date or a version date is a fact and stays.
function countDecisionDates(text) {
  let found = 0;
  for (const match of text.matchAll(DATE)) {
    const start = Math.max(0, match.index - DECISION_WINDOW);
    const end = Math.min(text.length, match.index + match[0].length + DECISION_WINDOW);
    if (DECISION_VERB.test(text.slice(start, end))) found += 1;
  }
  return found;
}

// Every detector below needs part-of-speech knowledge that a dependency-free
// script does not have, so each one over-counts or under-counts. They are
// printed for information and excluded from the headline total.

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'for', 'in', 'on', 'at', 'to',
  'from', 'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could',
  'should', 'may', 'might', 'must', 'that', 'this', 'these', 'those', 'it',
  'its', 'they', 'their', 'them', 'we', 'our', 'you', 'your', 'i', 'my', 'he',
  'she', 'his', 'her', 'not', 'no', 'if', 'when', 'while', 'than', 'then', 'so',
  'because', 'which', 'who', 'whom', 'whose', 'what', 'where', 'how', 'all',
  'any', 'each', 'every', 'some', 'more', 'most', 'other', 'into', 'over',
  'under', 'after', 'before', 'between', 'through', 'during', 'about',
  'against', 'up', 'down', 'out', 'off', 'again', 'further', 'once', 'here',
  'there', 'both', 'few', 'such', 'only', 'own', 'same', 'too', 'very'
]);

const SUBORDINATORS = /^(?:Having|While|Although|Though|When|Since|After|Before|If|Because|Once|Given|Following|Whereas|Unless|Where|As)\b[^.!?]*?,/;
const PARTICIPLE_OPENER = /^[A-Z][a-z]+ing\b[^.!?]*?,/;
const CLEFT = /^(?:What\b[^.!?]*?\b(?:is|was|are|were)\b|It(?:'s| is| was)\b[^.!?]*?\bthat\b)/;
const NOUN_SUBJECT_BEFORE_VERB = /\b(?:the|a|an|this|that|these|those)\s+(?:[a-z][\w-]*\s+){0,2}(?:wants|knows|thinks|decides|refuses|agrees|tries|promises|cares|likes|enjoys|suffers|wins|loses|beats|earns|deserves|expects|believes|remembers|forgets|waits|hopes|admits|insists)\b/gi;

function countNounClusters(sentences) {
  let found = 0;
  for (const sentence of sentences) {
    const tokens = sentence.split(/[^A-Za-z0-9'-]+/).filter(Boolean);
    let run = 0;
    for (const token of tokens) {
      if (FUNCTION_WORDS.has(token.toLowerCase())) {
        if (run >= 4) found += 1;
        run = 0;
      } else {
        run += 1;
      }
    }
    if (run >= 4) found += 1;
  }
  return found;
}

const DETECTORS = [
  {
    id: 'semicolon',
    label: 'semicolon',
    tier: 'exact',
    skills: BOTH,
    count: ctx => matchCount(ctx.text, /;/g)
  },
  {
    id: 'long-sentence',
    label: `sentence over ${SENTENCE_CAP} words`,
    tier: 'exact',
    skills: BOTH,
    count: ctx => ctx.sentences.filter(s => countWords(s) > SENTENCE_CAP).length
  },
  {
    id: 'there-is',
    label: 'there is / are / was / were',
    tier: 'exact',
    skills: BOTH,
    count: ctx => matchCount(ctx.text, /\bthere (?:is|are|was|were)\b/gi)
  },
  {
    id: 'rather-than',
    label: 'rather than',
    tier: 'exact',
    skills: [CONVERSATION],
    count: ctx => matchCount(ctx.text, /\brather than\b/gi)
  },
  {
    id: 'hold',
    label: 'hold, holds, holding, held',
    tier: 'exact',
    skills: [CONVERSATION],
    // Word boundaries already exclude placeholder, stakeholder, shareholder,
    // household, threshold, and holder. Literal physical holding is not
    // distinguished, which is recorded in tests/README.md.
    count: ctx => matchCount(ctx.text, /\b(?:hold|holds|holding|held)\b/gi)
  },
  {
    id: 'two-word-verb',
    label: 'figurative two-word verb',
    tier: 'exact',
    skills: [CONVERSATION],
    count: ctx => matchCount(ctx.text, new RegExp(
      '\\b(?:' + [
        'dressed (?:it |them |that )?up as',
        'papered over',
        'glossed over',
        'spun it as',
        'sugar-?coated',
        'walked (?:it |them |that )?back',
        'leaned into',
        'doubled down on',
        'unpacked',
        'landed on'
      ].join('|') + ')\\b', 'gi'))
  },
  {
    id: 'self-evaluation',
    label: 'evaluation of your own work',
    tier: 'exact',
    skills: [CONVERSATION],
    // "clean" and "nice" are excluded: both have common literal uses
    // ("a clean install"). That exclusion is recorded in tests/README.md.
    count: ctx => matchCount(ctx.text, /\b(?:earned its keep|paid off|shines|elegant|robust|exactly right|neat)\b/gi)
  },
  {
    id: 'permission-narration',
    label: 'permission narration',
    tier: 'exact',
    skills: [CONVERSATION],
    // "rather than asking" is excluded here because the rather-than detector
    // already counts it. Detectors never count the same string twice.
    count: ctx => matchCount(ctx.text, /\b(?:I decided|I went ahead|I took the liberty|I chose to|I'm going to ask you|I am going to ask you)\b/gi)
  },
  {
    id: 'worth-speech-act',
    label: 'worth + speech act',
    tier: 'exact',
    skills: [CONVERSATION],
    // Check 8 bans "worth <speech act>ing" in any position: as a sentence, as
    // a clause, and as a tail on a noun ("a gap worth naming"). The speech-act
    // verbs are a closed list, so the match is exact. "worth checking" and
    // "worth reading" describe actions and stay.
    count: ctx => matchCount(ctx.text, /\bworth (?:naming|stating|flagging|noting|mentioning|saying|calling out)\b/gi)
  },
  {
    id: 'first-person',
    label: 'first person',
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx =>
      matchCount(ctx.text, /\b(?:I|I'm|I've|I'll|I'd)\b/g) +
      matchCount(ctx.text, /\b(?:my|mine|we|we're|we've|we'll|our|ours)\b/gi)
  },
  {
    id: 'your-possessive',
    label: 'your',
    tier: 'exact',
    skills: [DOCUMENTATION],
    // The imperative "you" is standard in instructions and stays permitted, so
    // only the possessive is counted.
    count: ctx => matchCount(ctx.text, /\byour\b/gi)
  },
  {
    id: 'user-possessive',
    label: "the user's, their",
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx => matchCount(ctx.text, /\b(?:the user's|their)\b/gi)
  },
  {
    id: 'decision-date',
    label: 'a date recording a decision',
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx => countDecisionDates(ctx.text)
  },
  {
    id: 'agent-clause',
    label: 'an agent in a subordinate clause',
    tier: 'exact',
    skills: [DOCUMENTATION],
    // "you" is excluded. An agent in a subordinate clause is a violation, and
    // the skill separately permits the imperative "you" as standard in
    // instructions, so "before you run the build" is contested. The exact tier
    // takes only cases that need no judgement. Recorded in tests/README.md.
    count: ctx => matchCount(ctx.text, /\b(?:when|if|where|after|before)\s+(?:the user|the reader)\b/gi)
  },
  {
    id: 'noun-cluster',
    label: 'noun cluster of four or more',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => countNounClusters(ctx.sentences)
  },
  {
    id: 'fronted-clause',
    label: 'fronted clause opening',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => ctx.sentences.filter(s => SUBORDINATORS.test(s) || PARTICIPLE_OPENER.test(s)).length
  },
  {
    id: 'cleft',
    label: 'cleft opening',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => ctx.sentences.filter(s => CLEFT.test(s)).length
  },
  {
    id: 'animacy',
    label: 'a living-actor verb on a thing',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => matchCount(ctx.text, NOUN_SUBJECT_BEFORE_VERB)
  },
  {
    id: 'em-dash',
    label: 'em dash (information only, never a violation)',
    tier: 'approximate',
    skills: BOTH,
    // ASD-STE100 permits the em dash. Only published-prose bans it, as a voice
    // preference, and published-prose is out of scope for this harness.
    count: ctx => matchCount(ctx.text, /—/g)
  }
];

function buildContext(rawText) {
  const stripped = stripQuoted(rawText);
  // Sentence splitting needs the line structure, because it removes heading and
  // list markers anchored to the start of a line. String detectors need the
  // opposite: a phrase broken across a line wrap ("rather\nthan") must still
  // match, so they run against a whitespace-collapsed copy.
  const text = stripped.replace(/\s+/g, ' ');
  return { text, sentences: splitSentences(stripped), words: countWords(text) };
}

function runDetectors(rawText, skill) {
  const ctx = buildContext(rawText);
  const counts = {};
  for (const d of DETECTORS) {
    if (d.skills.includes(skill)) counts[d.id] = d.count(ctx);
  }
  return { counts, words: ctx.words };
}

module.exports = { DETECTORS, buildContext, runDetectors, SENTENCE_CAP };
