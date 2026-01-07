export type AndonStatus = "IDLE" | "RUNNING" | "STOP"

export interface Workstation {
  id: string
  name: string
  status: AndonStatus
}

export interface Line {
  id: string
  name: string
  workstations: Workstation[]
}

export interface Floor {
  id: string
  name: string
  lines: Line[]
}

export interface Workshop {
  id: string
  name: string
  floors: Floor[]
}
