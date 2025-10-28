import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import JoinScreen from "./screens/JoinGameScreen";
import StartScreen from "./screens/StartScreen";
import QuizOptions from "./screens/QuizOptions";
import QuizInput from "./screens/QuizInput";
import QuizYesNo from "./screens/QuizYesNo";
import RoundEnd from "./screens/RoundEnd";
import QuizMatching from "./screens/QuizMatching";
import QuizAnagram from "./screens/QuizAnagram";
import QuizAssociations from "./screens/QuizAssosiations";


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Join">
                <Stack.Screen name="Join" component={JoinScreen} options={{ headerBackVisible: false }}/>
                <Stack.Screen name="Start" component={StartScreen} />
                <Stack.Screen name="QuizOptions" component={QuizOptions} options={{ headerShown: false }}/>
                <Stack.Screen name="QuizInput" component={QuizInput} options={{ headerShown: false }}/>
                <Stack.Screen name="QuizYesNo" component={QuizYesNo} options={{ headerShown: false }}/>
                <Stack.Screen name="RoundEnd" component={RoundEnd} options={{ headerShown: false }}/>
                <Stack.Screen name="QuizMatching" component={QuizMatching} options={{ headerShown: false }}/>
                <Stack.Screen name="QuizAnagram" component={QuizAnagram} options={{ headerShown: false }}/>
                <Stack.Screen name="QuizAssociations" component={QuizAssociations} options={{ headerShown: false }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
