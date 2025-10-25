import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PublicMessageRequest } from "@/libs/sfs2x-api-1.8.4";

type Props = NativeStackScreenProps<any, "RoundEnd">;

export default function RoundEnd({ route }: Props) {
    // @ts-ignore
    const { sfs, playerId, onPlayerResult } = route.params;
    const [results, setResults] = useState<any[] | null>(null);
    const [waiting, setWaiting] = useState(false);

    const setResultsRef = useRef<(answers: any[]) => void>(() => {});

    useEffect(() => {
        setResultsRef.current = (answers: any[]) => {
            setResults(answers);
            setWaiting(false);
        };

        if (onPlayerResult) {
            onPlayerResult(setResultsRef.current);
        }
    }, [onPlayerResult]);

    const requestResults = () => {
        if (!sfs || waiting) return;
        if (!sfs.mySelf) return console.warn("SFS not ready yet!");

        setWaiting(true);

        const requestData = { type: "getResults", playerId };
        try {
            sfs?.send(new PublicMessageRequest(JSON.stringify(requestData)));
        } catch (err) {
            console.error("SFS send failed:", err);
            setWaiting(false);
        }
    };

    const totalPoints = results?.reduce((sum, r) => sum + r.points, 0) || 0;

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {results ? (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.title}>🏆 Round Results</Text>

                        <View style={styles.list}>
                            {results.map((r, idx) => (
                                <View key={idx} style={[styles.resultItem, r.correct && styles.correct]}>
                                    <Text style={styles.questionText}>
                                        Q{r.questionIndex + 1}: <Text style={styles.answerText}>{r.answer || "—"}</Text>
                                    </Text>
                                    <Text style={[styles.points, r.correct ? styles.pointsGood : styles.pointsBad]}>
                                        {r.correct ? `+${r.points}` : `+0`}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.total}>
                            Total: <Text style={styles.totalScore}>{totalPoints}</Text> pts
                        </Text>

                        <View style={styles.buttonWrapper}>
                            <Button title="Wait for Next Round" onPress={() => setResults(null)} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.waitingContainer}>
                        <Text style={styles.title}>⏳ Waiting for results...</Text>
                        <View style={styles.buttonWrapper}>
                            <Button
                                title={waiting ? "Waiting..." : "Get My Results"}
                                onPress={requestResults}
                                disabled={waiting}
                            />
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f2f4f8",
    },
    container: { width: "100%", alignItems: "center" },
    resultsContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    list: {
        width: "100%",
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    resultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#eee",
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    correct: {
        backgroundColor: "#e8fbe8",
    },
    questionText: {
        fontSize: 16,
        color: "#333",
    },
    answerText: {
        fontWeight: "500",
        color: "#000",
    },
    points: {
        fontSize: 16,
        fontWeight: "bold",
    },
    pointsGood: {
        color: "#2ecc71",
    },
    pointsBad: {
        color: "#e74c3c",
    },
    total: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 20,
    },
    totalScore: {
        color: "#3498db",
    },
    buttonWrapper: { width: 200, marginTop: 25, alignSelf: "center" },
    waitingContainer: {
        width: "100%",
        alignItems: "center",
        padding: 20,
    },
});
