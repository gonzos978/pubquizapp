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


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Join">
                <Stack.Screen name="Join" component={JoinScreen} />
                <Stack.Screen name="Start" component={StartScreen} />
                <Stack.Screen name="QuizOptions" component={QuizOptions} />
                <Stack.Screen name="QuizInput" component={QuizInput} />
                <Stack.Screen name="QuizYesNo" component={QuizYesNo} />
                <Stack.Screen name="RoundEnd" component={RoundEnd} />
                <Stack.Screen name="QuizMatching" component={QuizMatching} />
                <Stack.Screen name="QuizAnagram" component={QuizAnagram} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
