import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from "react-native";
import { PublicMessageRequest } from "@/libs/sfs2x-api-1.8.4";

export default function QuizAnagram({ route }: any) {
    const { question, sfs, mediaUrl } = route.params;

    const [timeLeft, setTimeLeft] = useState(question.timer ?? 0);
    const [answered, setAnswered] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [playerAnswer, setPlayerAnswer] = useState("");

    useEffect(() => {
        setAnswered(false);
        setTimeLeft(question.timer ?? 30);
        setStartTime(Date.now());
        setPlayerAnswer("");
    }, [question]);

    useEffect(() => {
        if (answered) return; // stop timer if answered

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswer(""); // auto-send empty answer when timer runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [answered]);

    const handleAnswer = (answer: string) => {
        if (!sfs || answered) return;

        const answerTime = Math.floor((Date.now() - startTime) / 1000); // seconds elapsed

        const answerData = {
            type: "PlayerAnswer",
            questionType: question.questionType,
            questionIndex: question.index,
            answer: answer.trim(),               // what the player typed
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,               // seconds elapsed
            correctAnswer: question.scrambledAnswer, // the correct solution
            scrambledWord: question.scrambledWord, // the scrambled version shown
            playerAnswer: answer.trim(),         // optional, can mirror 'answer' if needed
        };


        sfs.send(new PublicMessageRequest(JSON.stringify(answerData)));
        setAnswered(true); // disable input
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Top Info Bar */}
                <View style={styles.topBar}>
                    <Text style={styles.topLeft}>⏱ {timeLeft}s</Text>
                    <Text style={styles.topCenter}>{question.category ?? "General"}</Text>
                    <Text style={styles.topRight}>Q {question.index + 1}/{question.totalQuestions}</Text>
                </View>

                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: "green" }]} />
                    <Text style={styles.statusText}>Connected</Text>
                </View>

                {/* Question */}
                <Text style={styles.title}>{question.question}</Text>

                {/* Scrambled Word */}
                <Text style={styles.scrambledWord}>{question.scrambledWord}</Text>

                {/* Media or Spacer */}
                {mediaUrl ? (
                    <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="contain" />
                ) : (
                    <View style={styles.spacer} />
                )}

                {/* Input for Anagram Answer */}
                <TextInput
                    style={[styles.input, answered && { backgroundColor: "#ddd" }]}
                    placeholder="Type your answer here"
                    value={playerAnswer}
                    editable={!answered}
                    onChangeText={setPlayerAnswer}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, answered && { backgroundColor: "#999" }]}
                    disabled={answered || playerAnswer.trim() === ""}
                    onPress={() => handleAnswer(playerAnswer)}
                >
                    <Text style={styles.submitText}>Submit Answer</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        width: "100%",
        paddingHorizontal: 8,
    },
    topLeft: { fontSize: 16, fontWeight: "bold", textAlign: "left" },
    topCenter: { fontSize: 16, fontWeight: "bold", textAlign: "center", flex: 1 },
    topRight: { fontSize: 16, fontWeight: "bold", textAlign: "right" },
    statusContainer: {
        position: "absolute",
        top: 40,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
    statusText: { color: "#fff", fontWeight: "bold" },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 16,
    },
    scrambledWord: {
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 0.3,
        marginBottom: 20,
        textAlign: "center",
    },
    media: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginBottom: 20,
    },
    spacer: { height: 180, marginBottom: 20 },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    submitButton: {
        backgroundColor: "#2196f3",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 20,
        width: "100%",
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
