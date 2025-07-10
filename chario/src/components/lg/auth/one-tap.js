import { authClient } from "@/lib/auth-client";

export const oneTapCall = async () => {
    try {
        await authClient.oneTap({
            callbackURL: "/home/charities",
            cancelOnTapOutside: true,
            context: "signin",
            autoSelect: true,
        });
    } catch { }
};
