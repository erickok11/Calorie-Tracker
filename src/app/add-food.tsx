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
import { router } from "expo-router";

import { FOOD_UNITS, FoodUnit } from "@/constants/unit";

export default function AddFoodScreen() {
    const { addFood } = useFood();

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState<FoodUnit | undefined> (undefined);
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [showUnits, setShowUnits] = useState(false);

    const handleAddFood =  async () => {
        const amountNumber = amount.trim() === "" ? undefined : Number(amount);
        const calorieNumber = Number(calories);
        const proteinNumber = Number(protein);

        if(
            name.trim() === "" ||
            calories.trim() === "" ||
            protein.trim() === ""
        ){
            Alert.alert(
                "Missing information", 
                "Please enter food, calories, and protein."
            );
            return;
        }

        if(
            (amountNumber !== undefined && amountNumber <= 0) ||
            calorieNumber < 0 ||
            proteinNumber < 0
        ) {
            Alert.alert("Invalid values", "Please enter valid numbers.");
            return;
        }

        await addFood({
            name: name.trim(),
            amount: amountNumber,
            unit,
            calories: calorieNumber,
            protein: proteinNumber,
        });

        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable
                style={styles.container}
                onPress={Keyboard.dismiss}
            >
                <ScrollView style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Add Food</Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    <Text style={styles.label}>Food name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Chicken Breast"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Amount(Optional)</Text>
                    
                    <View style={styles.amountRow}>
                        <TextInput
                            style={[styles.input, styles.amountInput]}
                            placeholder="0.5"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
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
                            style={styles.input}
                            placeholder="300"
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.suffix}>kcal</Text>
                    </View>

                    <Text style={styles.label}>Protein</Text>
                    <View style={styles.numberContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="30"
                            value={protein}
                            onChangeText={setProtein}
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.suffix}>g</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddFood}
                    >
                        <Text style={styles.addButtonText}>Add to Today</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },

    content: {
        flex: 1,
        padding: 24,
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

    addButton: {
        backgroundColor: "#3478F6",
        borderRadius: 16,
        padding: 17,
        alignItems: "center",
        marginTop: 40,
    },

    addButtonText: {
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

    