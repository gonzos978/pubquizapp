import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import {PublicMessageRequest} from "@/libs/sfs2x-api-1.8.4";

export default function QuizAssociations({route}: any) {
    const {question, sfs} = route.params;
    const [timeLeft, setTimeLeft] = useState(question.timer ?? 30);
    const [answered, setAnswered] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());

    // One input per association column
    const [columnAnswers, setColumnAnswers] = useState<string[]>(Array(question.associations?.length ?? 0).fill(""));
    const [finalAnswer, setFinalAnswer] = useState("");

    useEffect(() => {
        setAnswered(false);
        setTimeLeft(question.timer ?? 30);
        setStartTime(Date.now());
        setColumnAnswers(Array(question.associations?.length ?? 0).fill(""));
        setFinalAnswer("");
    }, [question]);

    useEffect(() => {
        if (answered) return;

        const timer = setInterval(() => {

            // @ts-ignore
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [answered]);

    const handleColumnChange = (index: number, text: string) => {
        const updated = [...columnAnswers];
        updated[index] = text;
        setColumnAnswers(updated);
    };

    const handleSubmit = () => {
        if (!sfs || answered) return;

        const answerTime = Math.floor((Date.now() - startTime) / 1000);

        const answerData = {
            type: "PlayerAnswer",
            questionType: question.questionType,
            questionIndex: question.index,
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,
            columnAnswers: columnAnswers.map(a => a.trim()),  // array of typed answers
            finalAnswer: finalAnswer.trim(),                  // combined/final answer
            correctColumnAnswers: question.associations?.map((a: any) => a.correctAnswer) ?? [],
            correctFinalAnswer: question.associationFinalAnswer ?? "",
        };

        sfs.send(new PublicMessageRequest(JSON.stringify(answerData)));
        setAnswered(true);
    };

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

                {/* Inputs for each column */}
                {question.associations?.map((assoc: any, i: number) => (
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

                {/* Final Answer */}
                <Text style={styles.columnTitle}>Final Answer</Text>
                <TextInput
                    style={[styles.input, answered && {backgroundColor: "#ddd"}]}
                    placeholder="Enter final answer"
                    editable={!answered}
                    value={finalAnswer}
                    onChangeText={setFinalAnswer}
                />

                <TouchableOpacity
                    style={[styles.submitButton, answered && {backgroundColor: "#999"}]}
                    disabled={answered || columnAnswers.some(a => a.trim() === "") || finalAnswer.trim() === ""}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitText}>Submit Answers</Text>
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
    title: {fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20},
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
