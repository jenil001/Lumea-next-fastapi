/**
 * A comprehensive library of phrases associated with self-harm, suicidal ideation, and extreme distress.
 * This list is used to trigger Lumea's safety de-escalation modal.
 */
export const safetyPhrases = [
  "kill myself", "suicide", "end it all", "end my life", "want to die", 
  "commit suicide", "take my own life", "take my life", "kms", "slit my wrists",
  "cut my wrists", "slash my wrists", "hang myself", "overdose", "poison myself",
  "kill my self", "killing myself", "committing suicide", "ending it all",
  "better off dead", "wish i was dead", "let me die", "don't want to live",
  "don't wanna live", "can't live like this", "suicidial", "sucidial", "suiside",
  "going to end it", "take a bunch of pills", "pills to end it", "swallowing pills",
  "jump off a bridge", "jump off the roof", "jump in front of a train",
  "drive off a cliff", "bullet in my head", "shoot myself", "kms now",
  "death is the only way", "dying today", "i will die tonight", "die alone",
  "hanging from a rope", "rope around my neck", "strangle myself", "suffocate myself",
  "drown myself", "starve to death", "bleed out", "blood everywhere",
  "no point in living", "nothing to live for", "suicidal thoughts", "suicidal ideation",
  "final goodbye", "saying goodbye forever", "leaving this world", "won't be here",
  "last message", "last post", "final note", "suicide note", "suicide letter",
  "planning my death", "how to kill myself", "ways to die", "best way to die",
  "painless suicide", "easy way to end it", "permanent solution", "making it stop",
  "stop the pain permanently", "rest forever", "eternal sleep", "never waking up",
  "don't wanna wake up", "won't wake up", "i am gone", "i'm going away forever",
  "everything is over", "this is the end", "final hour", "last breath",
  "kms tonight", "kms today", "ready to die", "prepare to die", "dying soon",
  "death beckons", "embracing death", "going to kill myself", "will kill myself",
  "planning to kill myself", "decided to die", "death is coming", "welcome death",
  "saying bye to life", "quitting life", "life is done", "dying is easy",
  "prefer to be dead", "rather be dead", "wanting to die", "i want death"
];

// Helper to check for a match
export const isDistressDetected = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return safetyPhrases.some(phrase => lowerText.includes(phrase.toLowerCase()));
};
