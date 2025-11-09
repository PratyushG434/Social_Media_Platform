// store/useMediaStore.ts
import { create } from "zustand";

// useMediaStore.ts
interface MediaStore {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  stream: MediaStream | null;
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  setStream: (stream: MediaStream | null) => void;
  setVideoEnabled: (value: boolean) => void;
  setAudioEnabled: (value: boolean) => void;
  setSelectedCamera: (deviceId: string) => void;
  setSelectedMicrophone: (deviceId: string) => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  isVideoEnabled: true,
  isAudioEnabled: true,
  stream: null,
  selectedCamera: null,
  selectedMicrophone: null,
  setStream: (stream) => set({ stream }),
  setVideoEnabled: (value) => set({ isVideoEnabled: value }),
  setAudioEnabled: (value) => set({ isAudioEnabled: value }),
  setSelectedCamera: (deviceId) => set({ selectedCamera: deviceId }),
  setSelectedMicrophone: (deviceId) => set({ selectedMicrophone: deviceId }),
}));