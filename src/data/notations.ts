export interface Notation {
  id: string
  name: string
  alphabet: string // keyboard key to press
  image: string
}

// All available notations with their keyboard mappings - MAJOR NOTES ONLY
export const notations: Notation[] = [
  // Lowercase letters - MAJOR NOTES ONLY
  { id: "note-a", name: "Maguru White", alphabet: "a", image: "/Notes/aa.png" },
  { id: "note-d", name: "Guru White", alphabet: "d", image: "/Notes/dd.png" },
  { id: "note-g", name: "Bindu White", alphabet: "g", image: "/Notes/gg.png" },
  { id: "note-j", name: "Vasu White", alphabet: "j", image: "/Notes/jj.png" },
  { id: "note-m", name: "Praya White", alphabet: "m", image: "/Notes/mm.png" },
  { id: "note-p", name: "Danta White", alphabet: "p", image: "/Notes/pp.png" },

  // Time and rhythm notations
  { id: "note-s", name: "2 Times Left", alphabet: "s", image: "/Notes/ss.png" },
  { id: "note-t", name: "2 Times Right", alphabet: "t", image: "/Notes/tt.png" },
  { id: "note-u", name: "3 Times Left", alphabet: "u", image: "/Notes/uu.png" },
  { id: "note-v", name: "3 Times Right", alphabet: "v", image: "/Notes/vv.png" },
  { id: "note-w", name: "4 Times Left", alphabet: "w", image: "/Notes/ww.png" },
  { id: "note-x", name: "4 Times Right", alphabet: "x", image: "/Notes/xx.png" },

  // Special notations
  { id: "note-y", name: "Daro", alphabet: "y", image: "/Notes/yy.png" },
  { id: "note-z", name: "Enjo", alphabet: "z", image: "/Notes/zz.png" },

  // Uppercase letters - MAJOR NOTES ONLY
  { id: "note-A", name: "Lower Octave 1", alphabet: "A", image: "/Notes/A.png" },
  { id: "note-B", name: "Lower Octave 2", alphabet: "B", image: "/Notes/B.png" },
  { id: "note-C", name: "Middle Octave", alphabet: "C", image: "/Notes/C.png" },
  { id: "note-D", name: "Higher Octave 1", alphabet: "D", image: "/Notes/D.png" },
  { id: "note-E", name: "Higher Octave 2", alphabet: "E", image: "/Notes/E.png" },

  // Special major notations
  { id: "note-F", name: "Neredani", alphabet: "F", image: "/Notes/F.png" },
  { id: "note-G", name: "Dumbidani", alphabet: "G", image: "/Notes/G.png" },
  { id: "note-H", name: "Pisudani", alphabet: "H", image: "/Notes/H.png" },
  { id: "note-I", name: "Meludhani", alphabet: "I", image: "/Notes/I.png" },
  { id: "note-J", name: "Nakalu", alphabet: "J", image: "/Notes/J.png" },
  { id: "note-K", name: "Bhamini", alphabet: "K", image: "/Notes/K.png" },
  { id: "note-L", name: "Hindani", alphabet: "L", image: "/Notes/L.png" },
  { id: "note-M", name: "Mundani", alphabet: "M", image: "/Notes/M.png" },
  { id: "note-N", name: "Daneottu", alphabet: "N", image: "/Notes/N.png" },
  { id: "note-O", name: "Chimma", alphabet: "O", image: "/Notes/O.png" },
  { id: "note-P", name: "Najakath", alphabet: "P", image: "/Notes/P.png" },
  { id: "note-Q", name: "Cut Nit", alphabet: "Q", image: "/Notes/Q.png" },
  { id: "note-R", name: "Usha", alphabet: "R", image: "/Notes/R.png" },
  { id: "note-S", name: "Nisha", alphabet: "S", image: "/Notes/S.png" },
]

// Create keyboard mapping for quick lookup
export const keyboardMapping: { [key: string]: Notation } = {}
notations.forEach((notation) => {
  keyboardMapping[notation.alphabet] = notation
})

// Helper function to get notation by keyboard key
export const getNotationByKey = (key: string): Notation | null => {
  return keyboardMapping[key] || null
}

// Helper function to get notation by symbol (alias for getNotationByKey)
export const getNotationBySymbol = (symbol: string): Notation | null => {
  return keyboardMapping[symbol] || null
}

// Helper function to get all notations for a specific case
export const getLowercaseNotations = (): Notation[] => {
  return notations.filter((notation) => notation.alphabet >= "a" && notation.alphabet <= "z")
}

export const getUppercaseNotations = (): Notation[] => {
  return notations.filter((notation) => notation.alphabet >= "A" && notation.alphabet <= "Z")
}
