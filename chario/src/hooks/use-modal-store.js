// 'use client'
import { create } from "zustand";

// export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "editChannel" | "leaveServer" | "deleteServer" | "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage";

// interface ModalData {
//     server ?: Server;
//     channel ?: Channel;
//     channelType ?: ChannelType;
//     apiUrl ?: string;|
//     query ?: Record<string, any>;
// }

// interface ModalStore {
//     type: string;
// data: ModalData;
//     isOpen: Boolean;
//     onOpen: (type: ModalType, data?: ModalData) => void;
//     onClose: () => void;
// }

export const useModal = create((set) => ({
    general: {},
    type: null,
    data: {},
    isOpen: false,
    onOpen: (type, data) => {
        set({
            type,
            data,
            isOpen: true,
        })
    },
    onClose: () => {
        set({
            type: null,
            isOpen: false,
        })
    },

    setGeneral: (data) => {
        set({
            general: data,
        })
    },
}));