import { useFood } from "@/context/FoodContext";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProgressCircle from "@/components/ProgressCircle";

import {
  calculateTotalCalories,
  calculateTotalProtein
} from "@/utils/nutrition";

import {
  useGoal,
} from "@/context/GoalsContext";

import { useNavigation } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";

export default function HomeScreen() {
  const {calorieGoal, proteinGoal} = useGoal();

  const { foods } = useFood();

  const totalCalories = calculateTotalCalories(foods);
  const totalProtein = calculateTotalProtein(foods);

  const navigation = useNavigation();

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US",{
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => 
              navigation.dispatch(DrawerActions.openDrawer())
            }
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  menuIcon: {
    fontSize: 25,
    fontWeight: "600",
  },

  headerText: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  date: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  headerSpacer: {
    width: 44,
  },

});