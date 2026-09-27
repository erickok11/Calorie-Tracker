import { useFood } from "@/context/FoodContext";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProgressCircle from "@/components/ProgressCircle";

import {
  calculateTotalCalories,
  calculateTotalProtein
} from "@/utils/nutrition";

import {
  useGoal,
} from "@/context/GoalsContext";

export default function HomeScreen() {
  const {calorieGoal, proteinGoal} = useGoal();

  const { foods } = useFood();

  const totalCalories = calculateTotalCalories(foods);
  const totalProtein = calculateTotalProtein(foods);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Hello</Text>
        <Text style={styles.date}>Today</Text>

        <View style={styles.goalsRow}>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>CALORIES</Text>

            <ProgressCircle value={totalCalories} goal={calorieGoal} />

            <Text style={styles.remainingText}>
              {Math.max(calorieGoal - totalCalories, 0)} kcal remaining
            </Text>
          </View>

          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>PROTEIN</Text>

            <ProgressCircle value={totalProtein} goal={proteinGoal} unit="g" />

            <Text style={styles.remainingText}>
              {Math.max(proteinGoal-totalProtein, 0)}g remaining
            </Text>
          </View>
        </View>

        <Text style={styles.foodTitle}>TODAY'S FOOD</Text>

        {foods.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={styles.foodCard}
            onPress={() =>
              router.push({
                pathname: "/food-details",
                params: { id: food.id},
              })
            }
          >
            <View>
              <Text style={styles.foodName}>{food.name}</Text>

              <Text style={styles.foodInfo}>
                {food.calories} kcal • {food.protein}g protein
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/add-food")}
        >
          <Text style={styles.addButtonText}>+ Add Food</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },

  greeting: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 15,
  },

  date: {
    fontSize: 17,
    color: "#777",
    marginTop: 4,
    marginBottom: 25,
  },

  calorieCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
  },

  bigNumber: {
    fontSize: 52,
    fontWeight: "700",
  },

  label: {
    color: "#777",
    fontSize: 16,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 20,
  },

  remaining: {
    fontSize: 17,
    fontWeight: "600",
  },

  proteinCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  proteinNumber: {
    fontSize: 16,
    color: "#555",
  },

  progressBackground: {
    height: 7,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    marginTop: 18,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#3478F6",
    borderRadius: 10,
  },

  foodTitle: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
    marginBottom: 10,
  },

  foodCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  foodName: {
    fontSize: 17,
    fontWeight: "600",
  },

  foodInfo: {
    color: "#777",
    marginTop: 5,
  },

  addButton: {
    backgroundColor: "#3478F6",
    borderRadius: 16,
    padding: 17,
    alignItems: "center",
    marginTop: 10,
  },

  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  chevron: {
    fontSize: 28,
    color: "#AAA",
  },

  goalsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },

  goalCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center"
  },

  goalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777",
    letterSpacing: 0.8,
    marginBottom: 15,
  },

  goalValue: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 12,
  },

  goalTarget: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  remainingText: {
    fontSize: 12,
    color: "#777",
    marginTop: 12,
  },
});