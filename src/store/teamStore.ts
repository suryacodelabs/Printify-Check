
import { create } from 'zustand';

interface TeamState {
  isTeam: boolean;
  teamId: string | null;
  setIsTeam: (isTeam: boolean) => void;
  setTeamId: (teamId: string | null) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  isTeam: false,
  teamId: null,
  setIsTeam: (isTeam) => set({ isTeam }),
  setTeamId: (teamId) => set({ teamId }),
}));
