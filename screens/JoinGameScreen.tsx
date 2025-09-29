import React, { useState, useRef } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
const SFS2X = require("../libs/sfs2x-api-1.8.4");

export default function JoinScreen() {
    const navigation = useNavigation();
    const [teamName, setTeamName] = useState("");
    const [connected, setConnected] = useState(false);
    const [joined, setJoined] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [userCount, setUserCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const sfsRef = useRef<any>(null);

    const roomName = "QuizRoom";
    const maxAttempts = 5;

    const handleConnect = () => {
        if (!teamName.trim()) {
            Alert.alert("Error", "Please enter a Team Name");
            return;
        }

        const config = { host: "192.168.1.4", port: 8080, zone: "BasicExamples", debug: true };
        const sfs = new SFS2X.SmartFox(config);
        sfsRef.current = sfs;

        const connectToServer = () => {
            console.log(`Attempting connection ${attempts + 1}...`);
            sfs.connect();
        };

        // Connection events
        sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, (evt: any) => {
            if (evt.success) {
                setConnected(true);
                setAttempts(0);
                console.log("Connected to server");
                sfs.send(new SFS2X.LoginRequest(teamName));
            } else {
                if (attempts < maxAttempts - 1) {
                    setAttempts(prev => prev + 1);
                    setTimeout(connectToServer, 1000);
                } else {
                    Alert.alert("Connection Failed", "Could not connect to server after 5 attempts.");
                }
            }
        });

        sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, () => {
            setConnected(false);
            setJoined(false);
            setCurrentRoom(null);
            setUserCount(0);
            console.log("Connection lost. Retrying...");
            if (attempts < maxAttempts) {
                setAttempts(prev => prev + 1);
                setTimeout(connectToServer, 1000);
            } else {
                Alert.alert("Disconnected", "Cannot reconnect to server after 5 attempts.");
            }
        });

        sfs.addEventListener(SFS2X.SFSEvent.LOGIN, () => {
            console.log("Login successful");
            joinRoom();
        });

        sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, (evt: any) => {
            Alert.alert("Login Failed", evt.errorMessage);
        });

        sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, (evt: any) => {
            setJoined(true);
            setCurrentRoom(evt.room.name);
            setUserCount(evt.room.userCount);
            console.log("Joined room:", evt.room.name);

            // Navigate to StartScreen with SFS reference
            navigation.navigate("Start", {
                sfs: sfsRef.current,
                roomName: evt.room.name,
            });
        });

        sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, (evt: any) => setUserCount(evt.room.userCount));
        sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, (evt: any) => setUserCount(evt.room.userCount));

        connectToServer();
    };

    const joinRoom = () => {
        const sfs = sfsRef.current;
        if (!sfs) return;

        const rooms = sfs.roomManager.getRoomList();
        const exists = rooms.some((r: any) => r.name === roomName);

        if (!exists) {
            const settings = new SFS2X.RoomSettings(roomName);
            settings.maxUsers = 50;
            settings.isGame = true;

            sfs.addEventListener(
                SFS2X.SFSEvent.ROOM_ADD,
                (evt: any) => {
                    if (evt.room.name === roomName) {
                        sfs.send(new SFS2X.JoinRoomRequest(roomName));
                    }
                },
                { once: true }
            );

            sfs.send(new SFS2X.CreateRoomRequest(settings, true));
            return;
        }

        sfs.send(new SFS2X.JoinRoomRequest(roomName));
    };

    return (
        <View style={styles.container}>
            {/* Status indicator */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: connected ? "green" : "red" }]} />
                <Text style={styles.statusText}>
                    {connected ? (joined ? `${currentRoom} (${userCount} users)` : "Connected") : "Disconnected"}
                </Text>
            </View>

            <Text style={styles.title}>Join QuizSphere</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter Team Name"
                value={teamName}
                onChangeText={setTeamName}
            />

            <Button title="Connect & Join" onPress={handleConnect} disabled={connected || joined} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 15 },
    statusContainer: { position: "absolute", top: 40, right: 20, flexDirection: "row", alignItems: "center" },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    statusText: { fontSize: 14, fontWeight: "bold" },
});
