// lib/mock-data.ts

import { Workshop } from './andon';

export const workshops: Workshop[] = [
  {
    id: "candi-sewu",
    name: "Workshop Candi Sewu",
    floors: [1, 2, 3].map((floor) => ({
      id: `${floor}`, // <-- Ubah ke string
      name: `Lantai ${floor}`,
      lines: Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`, // <-- Ubah ke string
        name: `Line ${i + 1}`,
        workstations: Array.from({ length: 5 }, (_, j) => ({
          id: `${j + 1}`, // <-- Ubah ke string
          name: `Workstation ${j + 1}`,
          status: "IDLE",
        })),
      })),
    })),
  },
  {
    id: "sukosari",
    name: "Workshop Sukosari",
    floors: [],
  },
  {
    id: "tiron",
    name: "Workshop Tiron",
    floors: [],
  },
];