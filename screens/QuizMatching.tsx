import React, {useState, useMemo, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Image} from "react-native";
import {PublicMessageRequest} from "@/libs/sfs2x-api-1.8.4";

const shuffleArray = <T, >(arr?: T[]): T[] =>
    Array.isArray(arr) ? [...arr].sort(() => Math.random() - 0.5) : [];

const colors = ["#90cdf4", "#f6ad55", "#9f7aea", "#48bb78", "#f56565"];

interface QuizMatchingProps {
    route: {
        params: {
            data: any;
            question: string;
            leftItems: string[];
            rightItems: string[];
            reviewMode?: boolean;
            playerAnswers?: Record<string, string>;
            sfs: any;
        };
    };
}

export default function QuizMatching({route}: QuizMatchingProps) {
    const {data, leftItems, rightItems, reviewMode, playerAnswers, sfs} = route.params;

    const [timeLeft, setTimeLeft] = useState(data.timer ?? 0);
    const [startTime, setStartTime] = useState(Date.now());
    const [answered, setAnswered] = useState(false);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matches, setMatches] = useState<Record<string, string>>({});

    const shuffledLeft = useMemo(() => shuffleArray(leftItems), [leftItems]);
    const shuffledRight = useMemo(() => shuffleArray(rightItems), [rightItems]);


    useEffect(() => {
        setAnswered(false);
        setTimeLeft(data.timer ?? 30);
        setStartTime(Date.now());
    }, [data]);

    useEffect(() => {
        if (answered) return; // stop timer if already answered

        const timer = setInterval(() => {
            // @ts-ignore
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // @ts-ignore
                    handleSubmit(null); // auto-send no answer when timer runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [answered]);


    const handleSelect = (item: string, side: "left" | "right") => {
        if (reviewMode) return;
        if (side === "left") {
            setSelectedLeft(item);
        } else if (side === "right" && selectedLeft) {
            setMatches(prev => ({...prev, [selectedLeft]: item}));
            setSelectedLeft(null);
        }
    };

    const getColor = (left: string) => {
        const keys = Object.keys(matches);
        const index = keys.indexOf(left);
        return index >= 0 ? colors[index % colors.length] : "#ddd";
    };

    const allMatched = shuffledLeft.every(left => matches[left]);

    const handleSubmit = () => {
        const result: Record<string, { answer: string; correct: boolean }> = {};
        leftItems.forEach((left, i) => {
            const playerRight = matches[left];
            const correctRight = rightItems[i];
            result[left] = {
                answer: playerRight || "",
                correct: playerRight === correctRight,
            };
        });

        console.log("Player answers with correctness:", result);

        const answerTime = Math.floor((Date.now() - startTime) / 1000);

        const answerData = {
            type: "PlayerAnswer",
            questionType: "matching",
            questionIndex: data.index,
            answer: result,
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,
            correctAnswer: "",
            playerAnswer: -1,
            pointsToAward: data.pointsToAward,
        };

        sfs.send(new PublicMessageRequest(JSON.stringify(answerData)));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Top Info Bar */}
            <View style={styles.topBar}>
                <Text style={styles.topLeft}>⏱ {timeLeft}s</Text>
                <Text style={styles.topCenter}>{data.category ?? "General"}</Text>
                <Text style={styles.topRight}>
                    Q {data.index + 1}/{data.totalQuestions}
                </Text>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, {backgroundColor: "green"}]}/>
                <Text style={styles.statusText}>Connected</Text>
            </View>

            {/* Question */}
            <Text style={styles.title}>{data.question}</Text>

            {/* Media or Spacer */}
            {data.mediaUrl ? (
                <Image source={{uri: data.mediaUrl}} style={styles.media} resizeMode="contain"/>
            ) : (
                <View style={styles.spacer}/>
            )}

            <View style={styles.columns}>
                {/* Left Side */}
                <View style={styles.column}>
                    <Text style={styles.title}>Left Side</Text>
                    {shuffledLeft.map(left => {
                        const isSelected = selectedLeft === left;
                        const color = getColor(left);
                        const playerRight = reviewMode ? playerAnswers?.[left] : matches[left];
                        const correctRight = rightItems[leftItems.indexOf(left)];
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
                                        : {backgroundColor: color},
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
                                        style={{position: "absolute", width: "100%", height: "100%"}}
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
                                    style={[styles.item, {backgroundColor: color}]}
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
                    style={[styles.submitBtn, !allMatched && {opacity: 0.5}]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

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
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    topLeft: {fontSize: 16, fontWeight: "bold", textAlign: "left"},
    topCenter: {fontSize: 16, fontWeight: "bold", textAlign: "center", flex: 1},
    topRight: {fontSize: 16, fontWeight: "bold", textAlign: "right"},
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
    statusDot: {width: 12, height: 12, borderRadius: 6, marginRight: 6},
    statusText: {color: "#fff", fontWeight: "bold"},
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

    columns: {flexDirection: "row", justifyContent: "space-between", width: "100%"},
    column: {flex: 1, marginHorizontal: 10},
    item: {backgroundColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 8, alignItems: "center"},
    itemText: {fontSize: 16},
    selectedItem: {borderWidth: 2, borderColor: "#3182ce"},
    correctItem: {backgroundColor: "#c6f6d5", borderColor: "#38a169", borderWidth: 1},
    incorrectItem: {backgroundColor: "#fed7d7", borderColor: "#e53e3e", borderWidth: 1},
    submitBtn: {marginTop: 20, backgroundColor: "#3182ce", padding: 12, borderRadius: 10},
    submitText: {color: "white", fontWeight: "bold", textAlign: "center"},
});
