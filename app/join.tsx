import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function JoinGameScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join Game</Text>
            <Button title="Back to Scan" onPress={() => router.push("/")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, marginBottom: 20 },
});
