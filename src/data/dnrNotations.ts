import type { Notation } from "./notations"

export interface DNRNotation extends Notation {
  // DNRNotation extends Notation to maintain compatibility
}

// DNR-specific notations using images from public/DNR/ folder
export const dnrNotations: DNRNotation[] = [
  // Lowercase letters - DNR specific notations with simple a-z names
  { id: "dnr-a", name: "a", alphabet: "a", image: "/DNR/a.png" },
  { id: "dnr-b", name: "b", alphabet: "b", image: "/DNR/b.png" },
  { id: "dnr-c", name: "c", alphabet: "c", image: "/DNR/c.png" },
  { id: "dnr-d", name: "d", alphabet: "d", image: "/DNR/d.png" },
  { id: "dnr-e", name: "e", alphabet: "e", image: "/DNR/e.png" },
  { id: "dnr-f", name: "f", alphabet: "f", image: "/DNR/f.png" },
  { id: "dnr-g", name: "g", alphabet: "g", image: "/DNR/g.png" },
  { id: "dnr-h", name: "h", alphabet: "h", image: "/DNR/h.png" },
  { id: "dnr-i", name: "i", alphabet: "i", image: "/DNR/i.png" },
  { id: "dnr-j", name: "j", alphabet: "j", image: "/DNR/j.png" },
  { id: "dnr-k", name: "k", alphabet: "k", image: "/DNR/k.png" },
  { id: "dnr-l", name: "l", alphabet: "l", image: "/DNR/l.png" },
  { id: "dnr-m", name: "m", alphabet: "m", image: "/DNR/m.png" },
  { id: "dnr-n", name: "n", alphabet: "n", image: "/DNR/n.png" },
  { id: "dnr-o", name: "o", alphabet: "o", image: "/DNR/o.png" },
  { id: "dnr-p", name: "p", alphabet: "p", image: "/DNR/p.png" },
  { id: "dnr-q", name: "q", alphabet: "q", image: "/DNR/q.png" },
  { id: "dnr-r", name: "r", alphabet: "r", image: "/DNR/r.png" },
  { id: "dnr-s", name: "s", alphabet: "s", image: "/DNR/s.png" },
  { id: "dnr-t", name: "t", alphabet: "t", image: "/DNR/t.png" },
  { id: "dnr-u", name: "u", alphabet: "u", image: "/DNR/u.png" },
  { id: "dnr-v", name: "v", alphabet: "v", image: "/DNR/v.png" },
  { id: "dnr-w", name: "w", alphabet: "w", image: "/DNR/w.png" },
  { id: "dnr-x", name: "x", alphabet: "x", image: "/DNR/x.png" },
  { id: "dnr-y", name: "y", alphabet: "y", image: "/DNR/y.png" },
  { id: "dnr-z", name: "z", alphabet: "z", image: "/DNR/z.png" },
]

// Create keyboard mapping for quick lookup
export const dnrKeyboardMapping: { [key: string]: DNRNotation } = {}
dnrNotations.forEach((notation) => {
  dnrKeyboardMapping[notation.alphabet] = notation
})

// Helper function to get DNR notation by keyboard key
export const getDNRNotationByKey = (key: string): DNRNotation | null => {
  return dnrKeyboardMapping[key] || null
}

// Helper function to get DNR notation by symbol (alias for getDNRNotationByKey)
export const getDNRNotationBySymbol = (symbol: string): DNRNotation | null => {
  return dnrKeyboardMapping[symbol] || null
}

// Helper function to get all DNR notations for a specific case
export const getDNRLowercaseNotations = (): DNRNotation[] => {
  return dnrNotations.filter((notation) => notation.alphabet >= "a" && notation.alphabet <= "z")
}

export const getDNRUppercaseNotations = (): DNRNotation[] => {
  return dnrNotations.filter((notation) => notation.alphabet >= "A" && notation.alphabet <= "Z")
}
