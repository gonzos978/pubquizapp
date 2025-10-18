import { useEffect } from "react";
import { SFSEvent } from "sfs2x-api";

export function useQuizListener(sfs: any, navigation: any) {
    useEffect(() => {
        if (!sfs) return;

        const onPublicMessage = (evt: any) => {
            const message = evt.message;

            let data;
            try {
                data = typeof message === "string" ? JSON.parse(message) : message;
            } catch {
                return;
            }

            if (!data || data.type !== "quizQuestion") return;

            console.log("📩 Received quiz question:", data);

            // Navigate based on question type
            switch (data.format) {
                case "options":
                    navigation.navigate("QuizOptions", { question: data });
                    break;
                case "input":
                    navigation.navigate("QuizInput", { question: data });
                    break;
                case "yesno":
                    navigation.navigate("QuizYesNo", { question: data });
                    break;
                default:
                    console.warn("Unknown question format:", data.format);
            }
        };

        sfs.addEventListener(SFSEvent.PUBLIC_MESSAGE, onPublicMessage);

        return () => {
            sfs.removeEventListener(SFSEvent.PUBLIC_MESSAGE, onPublicMessage);
        };
    }, [sfs, navigation]);
}
