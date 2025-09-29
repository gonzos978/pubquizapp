import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function QuizInput({ route }: any) {
    const { question } = route.params;
    const [answer, setAnswer] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{question}</Text>
            <TextInput
                style={styles.input}
                placeholder="Type your answer..."
                value={answer}
                onChangeText={setAnswer}
            />
            <Button title="Submit" onPress={() => alert(`Answered: ${answer}`)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 22, marginBottom: 20 },
    input: {
        width: "80%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
});
