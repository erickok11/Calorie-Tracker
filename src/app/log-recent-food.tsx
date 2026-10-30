import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalSearchParams, useRouter } from "expo-router";

import { getRecentFoodById, RecentFoodRow } from "@/database/database";

import UnitPicker from "@/components/UnitPicker";

import { FoodUnit } from "@/constants/unit";

import { convertAmount, getCompatibleUnits } from "@/utils/units";

import { getServingRatio, scaleNutrients } from "@/utils/nutrition";

import { useFood } from "@/context/FoodContext";

export default function LogRecentFoodScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{id: string}>();

  const [food, setFood] = useState<RecentFoodRow | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const [amount, setAmount] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<FoodUnit | undefined>(undefined);

  const {addFood} = useFood();

  const [isSaving, setIsSaving] = useState(false);

  const { date } = useLocalSearchParams<{ date?: string}>();

  useEffect(() => {
    const loadFood = async () => {
      try {
        const recentFood = await getRecentFoodById(Number(id));
        setFood(recentFood);
        if (recentFood && recentFood.amount != null && recentFood.unit){
          setAmount(recentFood.amount.toString());
          setSelectedUnit(recentFood.unit as FoodUnit);
        }
      } finally {
        setLoading(false);
      }
    };

    if(id){
      loadFood();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!food) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Food not found.</Text>
      </SafeAreaView>
    );
  }

  const hasServingInfo =
    food.amount != null &&
    food.amount > 0 &&
    food.unit != null;

  const convertedAmount = 
    hasServingInfo && selectedUnit
      ? convertAmount(Number(amount), selectedUnit, food.unit as FoodUnit) : null;

  const ratio = hasServingInfo ? getServingRatio(convertedAmount, food.amount!) : 1;
  const nutrition = scaleNutrients(food, ratio);


  const consumedAmount = Number(amount);

  const canAdd = 
    !isSaving &&
    (
      !hasServingInfo ||
      (
        amount.trim() !== "" &&
        Number.isFinite(consumedAmount) &&
        consumedAmount > 0 &&
        selectedUnit !== undefined &&
        convertedAmount !== null &&
        Number.isFinite(convertedAmount) && 
        convertedAmount > 0
      )
    );

  const handleAddToToday = async () => {
    if(!canAdd) {
      Alert.alert(
        "Invalid amount",
        "Please enter a valid amount and unit."
      );
      return;
    }

    setIsSaving(true);

    try{
      await addFood({
        name: food.name,
        amount: hasServingInfo ? consumedAmount : undefined,
        unit: hasServingInfo ? selectedUnit : undefined,
        ...nutrition
      }, date);

      Keyboard.dismiss();
      router.dismissAll();
    } catch (error) {
      console.error("Failed to log recent food:", error);

      Alert.alert(
        "Error",
        "Could not add the food. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Log Recent Food</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.foodName}>
          {food.name}
        </Text>

        {hasServingInfo? (
          <>
            <Text style={styles.reference}>
              Original: {food.amount} {food.unit} = {" "}
              {food.calories} kcal · {food.protein}g protein
            </Text>

            {[
              { label: "Carbs", value: nutrition.carbs, unit: "g"},
              { label: "Fat", value: nutrition.fat, unit: "g"},
              { label: "Sugar", value: nutrition.sugar, unit: "g"},
              { label: "Fiber", value: nutrition.fiber, unit: "g"},
              { label: "Sodium", value: nutrition.sodium_mg, unit: "mg"},
            ].map((nutrient) => (
              <Text key = {nutrient.label} style={styles.resultValue}>
                {nutrient.label}: {" "}
                {nutrient.value === null
                  ? "N/A" : `${Number(nutrient.value.toFixed(1))} ${nutrient.unit}`}
              </Text>
            ))}

            <View style={styles.amountRow}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <View style={styles.unitPickerContainer}>
                <UnitPicker
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  units={getCompatibleUnits(food.unit as FoodUnit)}
                  allowNone={false}
                />
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.reference}>
            No serving amount recorded. Original nutrition will be used.
          </Text>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Nutrition
          </Text>

          <Text style={styles.resultValue}>
            {nutrition.calories.toFixed(0)} kcal
          </Text>

          <Text style={styles.resultValue}>
            {nutrition.protein.toFixed(0)}g protein
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            !canAdd && styles.addButtonDisabled,
          ]}
          disabled={!canAdd}
          onPress={handleAddToToday}
        >
          <Text style={styles.addButtonText}>
            {isSaving ? "Adding..." : "Add to Today"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 20,
  },

  backButton: {
    fontSize: 17,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  content: {
    padding: 20,
  },

  foodName: {
    fontSize: 26,
    fontWeight: "700",
  },

  reference: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },

  nutrition: {
    fontSize: 18,
    marginTop: 12,
  },

  label: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 24,
  marginBottom: 8,
},

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  

  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 18,
  },

  unitPickerContainer: {
    width: 100,
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
  },
});