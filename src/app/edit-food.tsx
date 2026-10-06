import { useState } from "react";
import {
    Alert,
    Keyboard,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { useFood } from "@/context/FoodContext";
import { router, useLocalSearchParams } from "expo-router";

import { FOOD_UNITS, FoodUnit } from "@/constants/unit";

export default function EditFoodScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { foods, updateFood } = useFood();

    const food = foods.find((food) => food.id === id);

    const [name, setName] = useState(food?.name ?? "");
    const [amount, setAmount] = useState(
        food?.amount?.toString() ?? ""
    );
    const [unit, setUnit] = useState<FoodUnit | undefined>(undefined);
    const [calories, setCalories] = useState(
        food?.calories.toString() ?? ""
    );
    const [protein, setProtein] = useState(
        food?.protein.toString() ?? ""
    )

    const [showUnits, setShowUnits] = useState(false);

    if (!food) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Food not found.</Text>
            </SafeAreaView>
        )
    };

    const handleSave = async () => {
        const amountNumber =
            amount.trim() === "" ? undefined : Number(amount);

        const calorieNum = Number(calories);
        const proteinNum = Number(protein);

        if(
            name.trim() === "" ||
            calories.trim() === "" ||
            protein.trim() === ""
        )
        {
            Alert.alert(
                "Missing information",
                "Please enter a food name, calories, and protein."
            );
            return;
        }

        if (
            (amountNumber !== undefined && amountNumber <= 0) ||
            calorieNum < 0 ||
            proteinNum < 0
        )
        {
            Alert.alert(
                "Invalid values",
                "Please enter a valid numbers."
            );
            return;
        }

        await updateFood({
            id: food.id,
            name: name.trim(),
            amount: amountNumber,
            unit: amountNumber === undefined ? undefined : unit,
            calories: calorieNum,
            protein: proteinNum,
        });

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
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Edit Food</Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    <Text style={styles.label}>Food name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Amount</Text>

                    <View style={styles.amountRow}>
                        <TextInput
                            style={[styles.input, styles.amountInput]}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            placeholder="Optional"
                        />
                    </View>

                    <View style={styles.unitSection}>
                        <Text style={styles.label}>Unit(Optional)</Text>

                        <TouchableOpacity
                            style={styles.unitSelector}
                            onPress={() => setShowUnits(!showUnits)}
                        >
                            <Text
                                style={[
                                    styles.unitSelectorText,
                                    !unit && styles.placeholderText,
                                ]}
                            >
                                {unit ?? "Select unit"}
                            </Text>

                            <Text style={styles.chevron}>
                                {showUnits ? "^" : "⌄"}
                            </Text>
                        </TouchableOpacity>

                        {showUnits && (
                            <View style={styles.unitOptions}>
                                <TouchableOpacity
                                    style={styles.unitOption}
                                    onPress={() => {
                                        setUnit(undefined);
                                        setShowUnits(false);
                                    }}
                                >
                                    <Text style={styles.unitOptionText}>
                                        None
                                    </Text>
                                </TouchableOpacity>

                                {FOOD_UNITS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.unitOption,
                                            unit === option && styles.selectedUnitOption,
                                        ]}
                                        onPress={() => {
                                            setUnit(option);
                                            setShowUnits(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.unitOptionText,
                                                unit === option &&
                                                    styles.selectedUnitOptionText,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                    
                    <Text style={styles.label}>Calories</Text>
                    <View style={styles.numberContainer}>
                        <TextInput
                            style={[styles.numberInput]}
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="decimal-pad"
                        />

                        <Text style={styles.suffix}>kcal</Text>
                    </View>

                    <Text style={styles.label}>Protein</Text>

                    <View style={styles.numberContainer}>
                        <TextInput
                            style={[styles.numberInput]}
                            value={protein}
                            onChangeText={setProtein}
                            keyboardType="decimal-pad"
                        />

                        <Text style={styles.suffix}>g</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },
    
    content: {
        padding: 24,
        paddingBottom: 50,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 35,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
    },

    cancel: {
        fontSize: 17,
        color: "#3478F6",
    },

    headerSpacer: {
        width: 50,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 18,
    },

    input: {
        backgroundColor: "white",
        borderRadius: 14,
        padding: 16,
        fontSize: 17,
    },

    amountRow: {
        flexDirection: "row",
        gap: 10,
    },

    amountInput: {
        flex: 1,
    },

    unitButton: {
        backgroundColor: "white",
        borderRadius: 14,
        paddingHorizontal: 22,
        justifyContent: "center",
    },

    unitText: {
        fontSize: 17,
        fontWeight: "600",
    },

    numberContainer: {
        backgroundColor: "white",
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },

    numberInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 17,
    },

    suffix: {
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

        unitSection: {
        marginTop: 16,
    },

    unitSelector: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    unitSelectorText: {
        fontSize: 16,
        color: "#000",
    },

    placeholderText: {
        color: "#9999"
    },

    chevron: {
        fontSize: 18,
        color: "#777",
    },

    unitOptions: {
        backgroundColor: "white",
        borderRadius: 12,
        marginTop: 6,
        overflow: "hidden",
    },

    unitOption: {
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },

    selectedUnitOption: {
        backgroundColor: "#F0F6FF",
    },

    unitOptionText: {
        fontSize: 16,
    },

    selectedUnitOptionText:{
        color: "#3478F6",
        fontWeight: "600",
    },
});