export interface Note {
  id: string
  name: string
  value: number
  symbol: string
  frequency: number
  pitch: string
  image: string
  octave?: number
}

export interface PlacedNote {
  id: string
  note: Note
  x: number
  y: number
  staffLine: number
  accidental?: "sharp" | "flat" | "natural"
  octave: number
}

export interface ScorePage {
  id: string
  title: string
  composer?: string
  projectType?: "DNG" | "DNR"
  notes: PlacedNote[]
  timeSignature: {
    numerator: number
    denominator: number
  }
  keySignature: string
  tempo: number
}
