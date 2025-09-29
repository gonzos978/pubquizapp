import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QRScannerScreen from '../screens/QRScannerScreen';
import JoinGameScreen from '../screens/JoinGameScreen';

export type RootStackParamList = {
    QRScanner: undefined;
    JoinGame: { gameUrl: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="QRScanner">
            <Stack.Screen
                name="QRScanner"
                component={QRScannerScreen}
                options={{ title: 'Scan QR Code' }}
            />
            <Stack.Screen
                name="JoinGame"
                component={JoinGameScreen}
                options={{ title: 'Join Game' }}
            />
        </Stack.Navigator>
    );
}
