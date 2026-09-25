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



export default function HomeScreen() {
  const calorieGoal = 1800;
  const proteinGoal = 140;

  const { foods } = useFood();

  const totalCalories = foods.reduce(
    (sum, food) => sum + food.calories,
    0
  );

  const totalProtein = foods.reduce(
    (sum, food) => sum + food.protein,
    0
  );

  const caloriesRemaining = calorieGoal - totalCalories;

  const proteinProgress = Math.min(
    (totalProtein / proteinGoal) * 100,
    100
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.date}>Today</Text>

        <View style={styles.calorieCard}>
          <Text style={styles.bigNumber}>{totalCalories}</Text>
          <Text style={styles.label}>kcal eaten</Text>

          <View style={styles.divider} />

          <Text style={styles.remaining}>
            {caloriesRemaining} kcal remaining
          </Text>
        </View>

        <View style={styles.proteinCard}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Protein</Text>

            <Text style={styles.proteinNumber}>
              {totalProtein} / {proteinGoal}g
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${proteinProgress}%` },
              ]}
            />
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
    height: 12,
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    marginTop: 15,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#3478F6",
    borderRadius: 20,
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
});