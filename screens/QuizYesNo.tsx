import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function QuizYesNo({ route, navigation }: any) {
    const { question } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{question}</Text>
            <Button title="Yes" onPress={() => alert("Answered YES")} />
            <Button title="No" onPress={() => alert("Answered NO")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 22, marginBottom: 20 },
});
