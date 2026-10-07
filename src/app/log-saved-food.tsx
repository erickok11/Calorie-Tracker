import { useEffect, useState } from "react";
import {
    Alert,
    InputAccessoryView,
    Keyboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import {
    getSavedFoodById,
    SavedFoodRow,
} from "@/database/database";

import {
    calculateNutrition,
} from "@/utils/nutrition";

import { useFood } from "@/context/FoodContext";

export default function LogSavedFoodScreen() {
    const router = useRouter();

    const { id } = useLocalSearchParams<{
        id: string;
    }>();

    const [food, setFood] = useState<SavedFoodRow | null>(null);

    const [amount, setAmount] = useState("");

    const { addFood } = useFood();

    useEffect(() => {
        const loadFood = async () => {
            if (!id) {
                return;
            }

            const savedFood = await getSavedFoodById(Number(id));

            setFood(savedFood);
        };
        
        loadFood();
    }, [id]);

    if (!food) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    const nutrition = calculateNutrition(
        food.serving_amount,
        food.calories,
        food.protein,
        Number(amount) || 0
    );

    const handelAddToToday = async () => {
        const consumedAmount = Number(amount);

        if(!consumedAmount || consumedAmount <= 0) {
            Alert.alert(
                "Invalid amount",
                "Please enter an amount greater than 0."
            );
            return;
        }

        await addFood({
            name: food.name,
            amount: consumedAmount,
            unit: food.serving_unit,
            calories: nutrition.calories,
            protein: nutrition.protein,
        });

        router.replace("/(drawer)");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButton}>
                        ‹ Back
                    </Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Log Food
                </Text>

                <View style={styles.headerSpacer} />
            </View>

            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.foodName}>
                        {food.name}
                    </Text>

                    <Text style={styles.reference}>
                        {food.serving_amount}{" "}
                        {food.serving_unit} ={" "}
                        {food.calories} kcal ·{" "}
                        {food.protein}g protein
                    </Text>

                    <Text style={styles.label}>
                        Amount eaten
                    </Text>

                    <View style={styles.amountRow}>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            inputAccessoryViewID="amountKeyboard"
                        />

                        <Text style={styles.unit}>
                            {food.serving_unit}
                        </Text>
                    </View>

                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>
                            Nutrition
                        </Text>

                        <Text style={styles.resultValue}>
                            {nutrition.calories.toFixed(0)} kcal
                        </Text>

                        <Text style={styles.resultValue}>
                            {nutrition.protein.toFixed(1)}g protein
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            (!amount || Number(amount) <= 0) &&
                                styles.addButtonDisabled,
                        ]}
                        disabled={!amount || Number(amount) <= 0}
                        onPress={handelAddToToday}
                    >
                        <Text style={styles.addButtonText}>
                            Add to Today
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>

            <InputAccessoryView nativeID="amountKeyboard">
                <View style={styles.keyboardToolbar}>
                    <TouchableOpacity
                        onPress={Keyboard.dismiss}
                    >
                        <Text style={styles.doneButton}>
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>
            </InputAccessoryView>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  },

  foodName: {
    fontSize: 26,
    fontWeight: "700",
  },

  reference: {
    fontSize: 15,
    color: "#777",
    marginTop: 6,
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
  },

  unit: {
    fontSize: 18,
    marginLeft: 12,
    minWidth: 50,
  },

  resultCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 18,
    marginTop: 24,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  resultValue: {
    fontSize: 18,
    marginTop: 4,
  },

  keyboardToolbar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "flex-end",
    backgroundColor: "#F5F5F5",
  },

  doneButton: {
    fontSize: 17,
    fontWeight: "600"
  },

  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },

  addButtonDisabled: {
    opacity: 0.4,
  },

  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  }
});