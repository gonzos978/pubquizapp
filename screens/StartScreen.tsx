import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
const SFS2X = require("../libs/sfs2x-api-1.8.4");

export default function StartScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { sfs, roomName } = route.params as any;

    const [gameStarted, setGameStarted] = useState(false);
    const [connected, setConnected] = useState(true);

    useEffect(() => {
        if (!sfs) return;

        const onPublicMessage = (evt: any) => {
            const { message, data } = evt; // ✅ data is the SFSObject

            if (data && data.containsKey("state")) {
                const state = data.getUtfString("state");
                console.log("Parsed state:", state);

                if (state === "START") {
                    const rawData = data.getUtfString("data");
                    const quizData = JSON.parse(rawData); // we serialize on send

                    //console.log("Quiz Data:", quizData);

                    setGameStarted(true);

                    if (quizData.type === "yesno") {
                        // @ts-ignore
                        navigation.navigate("QuizYesNo", { question: quizData.questionText });
                    } else if (quizData.type === "options") {
                        // @ts-ignore
                        navigation.navigate("QuizOptions", { question: quizData.questionText, options: quizData.options });
                    } else if (quizData.type === "input") {
                        // @ts-ignore
                        navigation.navigate("QuizInput", { question: quizData.questionText });
                    }
                }else if(state === "NEXT_QUESTION"){
                    const rawData = data.getUtfString("data");
                    const quizData = JSON.parse(rawData); // we serialize on send

                    if (quizData.type === "yesno") {
                        // @ts-ignore
                        navigation.navigate("QuizYesNo", { question: quizData.questionText });
                    } else if (quizData.type === "options") {
                        // @ts-ignore
                        navigation.navigate("QuizOptions", { question: quizData.questionText, options: quizData.options });
                    } else if (quizData.type === "input") {
                        // @ts-ignore
                        navigation.navigate("QuizInput", { question: quizData.questionText });
                    }

                }
            } else {
                //console.log("Received plain message:", message);
            }
        };

        const onConnectionLost = () => {
            setConnected(false);
            Alert.alert("Disconnected", "Lost connection to server.");
        };

        sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage);
        sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost);

        return () => {
            sfs.removeEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage);
            sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost);
        };
    }, [sfs]);

    const handleDisconnect = () => {
        if (sfs) sfs.disconnect();
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: connected ? "green" : "red" }]} />
                <Text style={styles.statusText}>
                    {connected ? (gameStarted ? "Game Started" : `In Room: ${roomName}`) : "Disconnected"}
                </Text>
            </View>

            <Text style={styles.title}>{gameStarted ? "Quiz Started!" : "Waiting for START..."}</Text>

            <Button title="Disconnect" onPress={handleDisconnect} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    statusContainer: { position: "absolute", top: 40, right: 20, flexDirection: "row", alignItems: "center" },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    statusText: { fontSize: 14, fontWeight: "bold" },
});
