import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform, Image
} from "react-native";
import {PublicMessageRequest} from "@/libs/sfs2x-api-1.8.4";

export default function QuizInput({route}: any) {
    const {question = {}, sfs, mediaUrl} = route.params || {};

    // Prevent crash if question is undefined
    const timer = question.timer ?? 30;
    const [timeLeft, setTimeLeft] = useState(timer);
    const [answered, setAnswered] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());

    // For write/anagram questions
    const [playerAnswer, setPlayerAnswer] = useState("");

    // For associations
    const [columnAnswers, setColumnAnswers] = useState<string[]>(Array(question.associations?.length ?? 0).fill(""));
    const [finalAnswer, setFinalAnswer] = useState("");

    useEffect(() => {
        setAnswered(false);
        setTimeLeft(question.timer ?? 30);
        setStartTime(Date.now());
        setPlayerAnswer("");
        setColumnAnswers(Array(question.associations?.length ?? 0).fill(""));
        setFinalAnswer("");
    }, [question]);

    useEffect(() => {
        if (answered) return;

        const timerInterval = setInterval(() => {

            // @ts-ignore
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerInterval);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [answered]);

    const handleColumnChange = (index: number, text: string) => {
        const updated = [...columnAnswers];
        updated[index] = text;
        setColumnAnswers(updated);
    };

    const handleSubmit = () => {
        if (!sfs || answered) return;

        const answerTime = Math.floor((Date.now() - startTime) / 1000);

        let answerData: any = {
            type: "PlayerAnswer",
            questionType: question.questionType,
            questionIndex: question.index,
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,
            answer: playerAnswer.trim(),
            correctAnswer: question.correctAnswer
        };

        /*if (question.questionType === "write" || question.questionType === "anagram") {
            answerData.answer = playerAnswer.trim();
            answerData.playerAnswer = playerAnswer.trim();
            answerData.correctAnswer = question.scrambledAnswer ?? "";
            if (question.scrambledWord) answerData.scrambledWord = question.scrambledWord;
        } else if (question.questionType === "associations") {
            answerData.columnAnswers = columnAnswers.map(a => a.trim());
            answerData.finalAnswer = finalAnswer.trim();
            answerData.correctColumnAnswers = question.associations?.map((a: any) => a.correctAnswer) ?? [];
            answerData.correctFinalAnswer = question.associationFinalAnswer ?? "";
        }*/

        sfs.send(new PublicMessageRequest(JSON.stringify(answerData)));
        setAnswered(true);
    };

    if (!question || !question.questionType) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text>Loading question...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Top Info Bar */}
                <View style={styles.topBar}>
                    <Text style={styles.topLeft}>⏱ {timeLeft}s</Text>
                    <Text style={styles.topCenter}>{question.category ?? "General"}</Text>
                    <Text style={styles.topRight}>Q {question.index + 1}/{question.totalQuestions}</Text>
                </View>

                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, {backgroundColor: "green"}]}/>
                    <Text style={styles.statusText}>Connected</Text>
                </View>

                <Text style={styles.title}>{question.question}</Text>

                {/* Media or Spacer */}
                {mediaUrl ? (
                    <Image source={{uri: question.mediaUrl}} style={styles.media} resizeMode="contain"/>
                ) : (
                    <View style={styles.spacer}/>
                )}

                {/* Write / Anagram Input */}
                {(question.questionType === "write" || question.questionType === "anagram") && (
                    <TextInput
                        style={[styles.input, answered && {backgroundColor: "#ddd"}]}
                        placeholder="Type your answer here"
                        value={playerAnswer}
                        editable={!answered}
                        onChangeText={setPlayerAnswer}
                    />
                )}

                {/* Associations Inputs */}
                {question.questionType === "associations" && question.associations?.map((assoc: any, i: number) => (
                    <View key={i} style={styles.columnBlock}>
                        <Text style={styles.columnTitle}>Column {i + 1}</Text>
                        <TextInput
                            style={[styles.input, answered && {backgroundColor: "#ddd"}]}
                            placeholder={`Answer for Column ${i + 1}`}
                            editable={!answered}
                            value={columnAnswers[i]}
                            onChangeText={text => handleColumnChange(i, text)}
                        />
                    </View>
                ))}

                {question.questionType === "associations" && (
                    <>
                        <Text style={styles.columnTitle}>Final Answer</Text>
                        <TextInput
                            style={[styles.input, answered && {backgroundColor: "#ddd"}]}
                            placeholder="Enter final answer"
                            editable={!answered}
                            value={finalAnswer}
                            onChangeText={setFinalAnswer}
                        />
                    </>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, answered && {backgroundColor: "#999"}]}
                    disabled={
                        answered ||
                        (question.questionType === "write" || question.questionType === "anagram"
                            ? playerAnswer.trim() === ""
                            : question.questionType === "associations"
                                ? columnAnswers.some(a => a.trim() === "") || finalAnswer.trim() === ""
                                : false)
                    }
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitText}>Submit Answer</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
        alignItems: "center",
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
    columnBlock: {width: "100%", marginBottom: 16},
    columnTitle: {fontSize: 18, fontWeight: "bold", marginBottom: 8},
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff"
    },
    submitButton: {
        backgroundColor: "#2196f3",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginTop: 12
    },
    submitText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
});
