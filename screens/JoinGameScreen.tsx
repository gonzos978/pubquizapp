import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinGame'>;

export default function JoinGameScreen({ route }: Props) {
    const { gameUrl } = route.params;

    const handleJoin = () => {
        // TODO: connect to SmartFox / game server using gameUrl
        alert(`Joining game at: ${gameUrl}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Game URL:</Text>
            <Text style={styles.url}>{gameUrl}</Text>
            <Button title="Join Game" onPress={handleJoin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    url: {
        fontSize: 16,
        marginBottom: 20,
        color: 'blue',
    },
});
