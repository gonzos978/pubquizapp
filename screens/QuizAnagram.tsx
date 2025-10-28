import React, {useEffect, useState} from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    View, Image
} from "react-native";
import {PublicMessageRequest} from "@/libs/sfs2x-api-1.8.4";
import {useNavigation} from "@react-navigation/native";

export default function QuizInput({route}: any) {
    const {question, sfs, mediaUrl} = route.params;

    const navigation = useNavigation();

    const [timeLeft, setTimeLeft] = useState(question?.timer ?? 30);
    const [answered, setAnswered] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [playerAnswer, setPlayerAnswer] = useState("");

    useEffect(() => {

        navigation.setOptions({
            headerBackVisible: false, // v6+
            // headerLeft: () => null, // fallback for older versions
        });
        setAnswered(false);
        setTimeLeft(question?.timer ?? 30);
        setStartTime(Date.now());
        setPlayerAnswer("");
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

    const handleSubmit = () => {
        if (!sfs || answered) return;

        const answerTime = Math.floor((Date.now() - startTime) / 1000);

        const answerData = {
            type: "PlayerAnswer",
            questionType: "write",
            questionIndex: question?.index ?? 0,
            teamName: sfs.mySelf.name,
            timeTaken: answerTime,
            answer: playerAnswer.trim(),
            correctAnswer: question?.correctAnswer ?? ""
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

                <Text style={styles.title}>{question?.question}</Text>


                {/* Media or Spacer */}
                {mediaUrl ? (
                    <Image source={{ uri: question.mediaUrl }} style={styles.media} resizeMode="contain" />
                ) : (
                    <View style={styles.spacer} />
                )}

                <TextInput
                    style={[styles.input, answered && {backgroundColor: "#ddd"}]}
                    placeholder="Type your answer here"
                    value={playerAnswer}
                    editable={!answered}
                    onChangeText={setPlayerAnswer}
                />

                <TouchableOpacity
                    style={[styles.submitButton, answered && {backgroundColor: "#999"}]}
                    disabled={answered || playerAnswer.trim() === ""}
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
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 16
    },
    submitButton: {
        backgroundColor: "#2196f3",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginBottom: 12
    },
    submitText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
    timer: {fontSize: 16, fontWeight: "bold", marginTop: 10},
});
