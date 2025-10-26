import React, { useState, useMemo } from "react";
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Image} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {PublicMessageRequest} from "@/libs/sfs2x-api-1.8.4";

type RootStackParamList = {
    QuizMatching: {
        data:any,
        question: string;
        leftItems: string[];
        rightItems: string[];
        reviewMode?: boolean;
        playerAnswers?: Record<string, string>; // leftItem -> rightItem
        sfs:any,
    };
};

type Props = NativeStackScreenProps<RootStackParamList, "QuizMatching">;

const shuffleArray = <T,>(arr?: T[]): T[] =>
    Array.isArray(arr) ? [...arr].sort(() => Math.random() - 0.5) : [];

const colors = ["#90cdf4", "#f6ad55", "#9f7aea", "#48bb78", "#f56565"];

const QuizMatching: React.FC<Props> = ({ route, navigation }) => {
    const {data, question, leftItems, rightItems, reviewMode, playerAnswers, sfs } = route.params;

    const [timeLeft, setTimeLeft] = useState(data.timer ?? 0);
    const [startTime, setStartTime] = useState(Date.now());

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matches, setMatches] = useState<Record<string, string>>({});

    const shuffledLeft = useMemo(() => shuffleArray(leftItems), [leftItems]);
    const shuffledRight = useMemo(() => shuffleArray(rightItems), [rightItems]);

    // handle selection for left/right clicks
    const handleSelect = (item: string, side: "left" | "right") => {
        if (reviewMode) return; // disable selection in review
        if (side === "left") {
            setSelectedLeft(item);
        } else if (side === "right" && selectedLeft) {
            setMatches(prev => ({ ...prev, [selectedLeft]: item }));
            setSelectedLeft(null);
        }
    };

    // compute color for a left item
    const getColor = (left: string) => {
        const keys = Object.keys(matches);
        const index = keys.indexOf(left);
        return index >= 0 ? colors[index % colors.length] : "#ddd";
    };

    // enable submit only if all left items are matched
    const allMatched = shuffledLeft.every(left => matches[left]);

    const handleSubmit = () => {
        const result: Record<string, { answer: string; correct: boolean }> = {};

        leftItems.forEach((left, i) => {
            const playerRight = matches[left]; // what player selected
            const correctRight = rightItems[i]; // correct answer from original question
            result[left] = {
                answer: playerRight || "",
                correct: playerRight === correctRight
            };
        });

        console.log("Player answers with correctness:", result);

        const answerTime = Math.floor((Date.now() - startTime) / 1000); // seconds elapsed

        const answerData = {
            type: "PlayerAnswer",
            questionType:"matching",
            questionIndex: data.index,
            answer: result ?? "", // empty if auto timeout
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,//<-- send time here
            correctAnswer: "",
            playerAnswer:-1,
            pointsToAward:data.pointsToAward,
        };

        sfs.send(new PublicMessageRequest(JSON.stringify(answerData)));


    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Top Info Bar */}
            <View style={styles.topBar}>
                <Text style={styles.topLeft}>⏱ {timeLeft}s</Text>
                <Text style={styles.topCenter}>{data.category ?? "General"}</Text>
                <Text style={styles.topRight}>Q {data.index + 1}/{data.totalQuestions}</Text>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: "green" }]} />
                <Text style={styles.statusText}>Connected</Text>
            </View>

            {/* Question */}
            <Text style={styles.title}>{data.question}</Text>

            {/* Media or Spacer */}
            {data.mediaUrl ? (
                <Image source={{ uri: data.mediaUrl }} style={styles.media} resizeMode="contain" />
            ) : (
                <View style={styles.spacer} />
            )}

            <View style={styles.columns}>
                {/* Left Side */}
                <View style={styles.column}>
                    <Text style={styles.title}>Left Side</Text>
                    {shuffledLeft.map(left => {
                        const isSelected = selectedLeft === left;
                        const color = getColor(left);
                        const playerRight = reviewMode ? playerAnswers?.[left] : matches[left];
                        const correctRight = rightItems?.[shuffledLeft.indexOf(left)];
                        const isCorrect = playerRight === correctRight;

                        return (
                            <View
                                key={left}
                                style={[
                                    styles.item,
                                    reviewMode
                                        ? isCorrect
                                            ? styles.correctItem
                                            : styles.incorrectItem
                                        : { backgroundColor: color },
                                    isSelected && !reviewMode && styles.selectedItem,
                                ]}
                            >
                                <Text style={styles.itemText}>{left}</Text>
                                {reviewMode && (
                                    <Text style={styles.itemText}>
                                        → {playerRight || "No answer"}{" "}
                                        {playerRight !== correctRight && `(Correct: ${correctRight})`}
                                    </Text>
                                )}
                                {!reviewMode && (
                                    <TouchableOpacity
                                        style={{ position: "absolute", width: "100%", height: "100%" }}
                                        onPress={() => handleSelect(left, "left")}
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Right Side */}
                {!reviewMode && (
                    <View style={styles.column}>
                        <Text style={styles.title}>Right Side</Text>
                        {shuffledRight.map(right => {
                            const leftMatched = Object.keys(matches).find(l => matches[l] === right);
                            const color = leftMatched ? getColor(leftMatched) : "#ddd";

                            return (
                                <TouchableOpacity
                                    key={right}
                                    style={[styles.item, { backgroundColor: color }]}
                                    onPress={() => handleSelect(right, "right")}
                                >
                                    <Text style={styles.itemText}>{right}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            {!reviewMode && (
                <TouchableOpacity
                    disabled={!allMatched}
                    style={[styles.submitBtn, !allMatched && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

export default QuizMatching;

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: "center" },
    question: { fontSize: 20, fontWeight: "600", marginBottom: 20, textAlign: "center" },
    columns: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
    column: { flex: 1, marginHorizontal: 10 },
    item: { backgroundColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 8, alignItems: "center" },
    itemText: { fontSize: 16 },
    selectedItem: { borderWidth: 2, borderColor: "#3182ce" },
    matchedItem: { backgroundColor: "#c6f6d5" },
    correctItem: { backgroundColor: "#c6f6d5", borderColor: "#38a169", borderWidth: 1 },
    incorrectItem: { backgroundColor: "#fed7d7", borderColor: "#e53e3e", borderWidth: 1 },
    submitBtn: { marginTop: 20, backgroundColor: "#3182ce", padding: 12, borderRadius: 10 },
    submitText: { color: "white", fontWeight: "bold" },
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
});
