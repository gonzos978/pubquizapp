import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { PublicMessageRequest } from "@/libs/sfs2x-api-1.8.4";

export default function QuizOptions({ route }: any) {
    const { question, sfs, mediaUrl } = route.params;

    const [timeLeft, setTimeLeft] = useState(question.timer ?? 0);
    const [answered, setAnswered] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());


    useEffect(() => {
        setAnswered(false);
        setTimeLeft(question.timer ?? 30);
        setStartTime(Date.now());
    }, [question]);

    useEffect(() => {
        if (answered) return; // stop timer if already answered

        const timer = setInterval(() => {
            // @ts-ignore
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // @ts-ignore
                    handleAnswer(null); // auto-send no answer when timer runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [answered]);

    const handleAnswer = (opt: string, buttonIndex?: number) => {
        if (!sfs || answered) return;

        const answerTime = Math.floor((Date.now() - startTime) / 1000); // seconds elapsed

        const answerData = {
            type: "PlayerAnswer",
            questionIndex: question.index,
            questionType: "multiple",
            answer: opt ?? "", // empty if auto timeout
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,
            correctAnswer: question.correctAnswer,
            playerAnswer:buttonIndex,
            pointsToAward: question.pointsToAward,
        };

        sfs.send(new PublicMessageRequest(JSON.stringify(answerData)));
        setAnswered(true); // stop timer and disable buttons
    };

    return (
        <View style={styles.container}>
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

            {/* Media or Spacer */}
            {mediaUrl ? (
                <Image source={{ uri: question.mediaUrl }} style={styles.media} resizeMode="contain" />
            ) : (
                <View style={styles.spacer} />
            )}

            {/* Options */}
            <ScrollView style={styles.optionsContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                {question.options.map((opt: string, i: number) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.optionButton,
                            answered && { backgroundColor: "#999" } // grey out if answered
                        ]}
                        onPress={() => handleAnswer(opt, i)}
                        disabled={answered} // disable button after answering
                    >
                        <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

// styles remain the same

// styles remain the same as your code

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: "#f5f5f5",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
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
    media: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginBottom: 20,
    },
    spacer: {
        height: 180, // pushes options down when no image
        marginBottom: 20,
    },
    optionsContainer: { width: "100%" },
    optionButton: {
        backgroundColor: "#2196f3",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    optionText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
});
