import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";

export default function QuizOptions({ route, navigation }: any) {
    const { question, options, mediaUrl, index: questionIndex, totalQuestions = 10, category, timer, sfs, roomName } = route.params;

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answersDisabled, setAnswersDisabled] = useState(false);

    useEffect(() => {
        if (!sfs) return;

        // Listen for next question from server
        const onNextQuestion = (evt: any) => {
            try {
                const data = JSON.parse(evt.message);
                if (data.type === "quizQuestion") {
                    // Reset state for new question
                    setSelectedOption(null);
                    setAnswersDisabled(false);

                    navigation.push("QuizOptions", {
                        ...data,
                        sfs,
                        roomName,
                        totalQuestions,
                    });
                }
            } catch (e) {
                console.log("Chat message (non-JSON):", evt.message);
            }
        };

        sfs.addEventListener("publicMessage", onNextQuestion);

        return () => {
            sfs?.removeEventListener("publicMessage", onNextQuestion);
        };
    }, [sfs]);

    const handleAnswer = (opt: string) => {
        if (!sfs || !roomName) return;

        setSelectedOption(opt);
        setAnswersDisabled(true);

        const payload = {
            type: "quizAnswer",
            questionIndex,
            answer: opt,
        };

        try {
            sfs.send(new sfs.constructor.PublicMessageRequest(JSON.stringify(payload), roomName));
            console.log("Answer sent:", payload);
        } catch (err) {
            console.error("Failed to send answer:", err);
            Alert.alert("Error", "Failed to send answer to server.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Info Bar */}
            <View style={styles.topBar}>
                <Text style={styles.topLeft}>⏱ {timer ?? 0}s</Text>
                <Text style={styles.topCenter}>{category ?? "General"}</Text>
                <Text style={styles.topRight}>Q {questionIndex + 1}/{totalQuestions}</Text>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: "green" }]} />
                <Text style={styles.statusText}>Connected</Text>
            </View>

            {/* Question */}
            <Text style={styles.title}>{question}</Text>

            {/* Media */}
            {mediaUrl ? (
                <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="contain" />
            ) : (
                <View style={styles.spacer} />
            )}

            {/* Options */}
            <ScrollView style={styles.optionsContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                {options.map((opt: string, i: number) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.optionButton,
                            selectedOption === opt ? styles.optionSelected : {},
                        ]}
                        onPress={() => handleAnswer(opt)}
                        disabled={answersDisabled}
                    >
                        <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, backgroundColor: "#f5f5f5" },
    topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 8 },
    topLeft: { fontSize: 16, fontWeight: "bold", textAlign: "left" },
    topCenter: { fontSize: 16, fontWeight: "bold", textAlign: "center", flex: 1 },
    topRight: { fontSize: 16, fontWeight: "bold", textAlign: "right" },
    statusContainer: { position: "absolute", top: 40, right: 20, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
    statusText: { color: "#fff", fontWeight: "bold" },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginVertical: 16 },
    media: { width: "100%", height: 220, borderRadius: 12, marginBottom: 20 },
    spacer: { height: 180, marginBottom: 20 },
    optionsContainer: { width: "100%" },
    optionButton: { backgroundColor: "#2196f3", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 12 },
    optionSelected: { backgroundColor: "#4caf50" },
    optionText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
