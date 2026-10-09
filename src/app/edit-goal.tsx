import { useState } from "react";
import {
    Alert,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useGoal } from "@/context/GoalsContext";
import { router } from "expo-router";

export default function EditGoalsScreen() {
    const {
        calorieGoal,
        proteinGoal,
        updateGoal,
    } = useGoal();

    const [calories, setCalories] = useState(
        calorieGoal.toString()
    );

    const [protein, setProtein] = useState(
        proteinGoal.toString()
    );

    const handleSave = async() => {
        if (
            calories.trim() === "" ||
            protein.trim() === "" 
        ){
            Alert.alert(
                "Missing information",
                "Please enter both calories and protein goals."
            )

            return;
        }

        const calorieNum = Number(calories);
        const proteinNum = Number(protein);

        if (
            calorieNum <= 0 || 
            proteinNum <= 0
        ){
            Alert.alert(
                "Invalid numbers",
                "Your goals must be greater than 0."
            );

            return;
        }

        await updateGoal(calorieNum, proteinNum);

        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable
                style={styles.container}
                onPress={Keyboard.dismiss}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButton}>‹ Back</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Daily Goals</Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    <Text style={styles.description}>
                        Set your daily calorie and protein goals.
                    </Text>

                    <Text style={styles.label}>
                        Calories
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.input}
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="number-pad"
                            placeholder="1800"
                        />

                        <Text style={styles.unit}>kcal</Text>
                    </View>

                    <Text style={styles.label}>
                        Protein
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={protein}
                            onChangeText={setProtein}
                            keyboardType="number-pad"
                            placeholder="140"
                        />

                        <Text style={styles.unit}>g</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "F7F7F7",
    },

    content: {
        padding: 24,
        paddingBottom: 50,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },

    backButton: {
        fontSize: 17,
        color: "#3478F6",
    },

    title: {
        fontSize: 30,
        fontWeight: "700",
    },

    headerSpacer: {
        width: 50,
    },

    description: {
        fontSize: 15,
        color: "#777",
        marginBottom: 25,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 15,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 14,
        paddingHorizontal: 16,
    },

    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 18,
    },

    unit: {
        fontSize: 16,
        color: "#777",
    },

    saveButton: {
        backgroundColor: "#3478F6",
        borderRadius: 16,
        padding: 17,
        alignItems: "center",
        marginTop: 40,
    },

    saveButtonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },
});