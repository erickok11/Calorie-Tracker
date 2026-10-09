import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalSearchParams, useRouter } from "expo-router";

import { getSavedFoodById, updateSavedFood } from "@/database/database";

import UnitPicker from "@/components/UnitPicker";

import type { FoodUnit } from "@/constants/unit";

export default function EditSavedFoodScreen() {
    const router = useRouter();
    const {id} = useLocalSearchParams<{ id:string }>();

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState<FoodUnit | undefined>(undefined);
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");

    useEffect(() => {
        let active = true;

        const loadFood = async () => {
            try {
                const foodId = Number(id);

                if(!Number.isInteger(foodId) || foodId <= 0){
                    if(active) setNotFound(true);
                    return;
                }

                const food = await getSavedFoodById(foodId);

                if(!active) return;

                if (!food) {
                    setNotFound(true);
                    return;
                }
                
                setName(food.name);
                setAmount(food.serving_amount.toString());
                setUnit(food.serving_unit as FoodUnit);
                setCalories(food.calories.toString());
                setProtein(food.protein.toString());
            } catch (error) {
                console.error("Failed to load saved food:", error);

                if (active) setNotFound(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadFood();

        return () => {
            active = false;
        };
    }, [id]);

    const handleSave = async () => {
        const servingAmount = Number(amount);
        const calorieValue = Number(calories);
        const proteinValue = Number(protein);

        if (!name.trim()) {
            Alert.alert("Invalid name", "Please enter a food name.");
            return;
        }

        if(
            !amount.trim() ||
            !Number.isFinite(servingAmount) ||
            servingAmount <= 0 ||
            !unit
        ) {
            Alert.alert(
                "Invalid serving",
                "Please enter a valid serving amount and unit."
            );
            return;
        }

        if (isSaving) return;

        setIsSaving(true);

        try {
            await updateSavedFood(Number(id), {
                name: name.trim(),
                serving_amount: servingAmount,
                serving_unit: unit,
                calories: calorieValue,
                protein: proteinValue,
            });

            Keyboard.dismiss();
            router.back();
        } catch (error) {
            console.error("Failed to update saved food:", error);

            Alert.alert(
                "Error",
                "Could not save changes. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>‹ Back</Text>
                </TouchableOpacity>
                <Text>Saved food not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>‹ Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Edit Saved Food</Text>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <Text style={styles.label}>Food Name</Text>
                <View style={styles.amountRow}>
                    <TextInput
                        style={[styles.input, styles.amountInput]}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="Amount"
                    />

                    <View style={styles.unitPickerContainer}>
                        <UnitPicker
                            value={unit}
                            onChange={setUnit}
                            allowNone={false}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Calories (kcal)</Text>
                <TextInput
                    style={styles.input}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="decimal-pad"
                    placeholder="Calories"
                />

                <Text style={styles.label}>Protein (g)</Text>
                <TextInput
                    style={styles.input}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="decimal-pad"
                    placeholder="Protein"
                />

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        isSaving && styles.saveButtonDisabled,
                    ]}
                    disabled={isSaving}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    backButton: {
        fontSize: 17,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
    },

    headerSpacer: {
        width: 50,
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
    },

    input: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 17,
    },

    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    amountInput: {
        flex: 1,
        minWidth: 0
    },

    unitPickerContainer: {
        width: 110,
    },

    saveButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 32,
    },

    saveButtonDisabled: {
        opacity: 0.5,
    },

    saveButtonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },
});