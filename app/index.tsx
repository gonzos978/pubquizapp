import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";

export default function Page() {
    useEffect(() => {
        console.log("Page mounted!");
        window.alert("Page mounted!"); // force visible alert
    }, []);

    const handleClick = () => {
        console.log("Button clicked!");
        window.alert("Button clicked!");
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Test Page</Text>
            <Button title="Click me" onPress={handleClick} />
        </View>
    );
}
