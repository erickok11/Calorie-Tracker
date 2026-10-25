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

import { useNavigation, useFocusEffect } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";

import { useCallback, useState } from "react";
import {
  getDashboardNutrientSettings,
  type DashboardNutrient,
  type DashboardNutrientSetting,
} from "@/database/database";

const EXTRA_NUTRIENTS: {
  key: DashboardNutrient;
  label: string;
  unit: string;
  color: string;
  isLimit: boolean;
}[] = [
  {
    key: "carbs",
    label: "Carbs",
    unit: "g",
    color: "#D89B36",
    isLimit: false,
  },
  {
    key: "fat",
    label: "Fat",
    unit: "g",
    color: "#A480DA",
    isLimit: false,
  },
  {
    key: "sugar",
    label: "Sugar",
    unit: "g",
    color: "#DA7993",
    isLimit: true,
  },
  {
    key: "fiber",
    label: "Fiber",
    unit: "g",
    color: "#36A781",
    isLimit: false,
  },
  {
    key: "sodium_mg",
    label: "Sodium",
    unit: "mg",
    color: "#7895BF",
    isLimit: true,
  },
]

export default function HomeScreen() {
  const {calorieGoal, proteinGoal} = useGoal();

  const { foods } = useFood();

  const [dashboardSettings, setDashboardSettings] = useState<DashboardNutrientSetting[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDashboardSettings = async () => {
        try {
          const settings = await getDashboardNutrientSettings();

          if(active) {
            setDashboardSettings(settings);
          }
        } catch(error) {
          console.error(
            "Failed to load dashboard settings:",
            error
          );
        }
      };
      void loadDashboardSettings();

      return () => {
        active = false;
      };
    }, [])
  );

  const totalCalories = calculateTotalCalories(foods);
  const totalProtein = calculateTotalProtein(foods);

  const extraRings = EXTRA_NUTRIENTS.flatMap((nutrient) => {
    const setting = dashboardSettings.find(
      (item) => item.nutrient === nutrient.key
    );

    if (!setting || setting.is_visible !== 1){
      return [];
    }

    const values = foods.map(
      (food) => food[nutrient.key]
    )

    const knownValues = values.filter(
      (value): value is number =>
          typeof value === "number" &&
          Number.isFinite(value)
    );

    const total = knownValues.reduce(
      (sum,value) => sum + value, 0
    );

    const missingCount = foods.length - knownValues.length;

    return [
      {
        ...nutrient,
        total,
        goal: setting.goal,
        missingCount,
        hasData:
          foods.length === 0 || knownValues.length > 0,
      },
    ];
  });

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
              {Math.max(calorieGoal - totalCalories, 0).toFixed(0)} kcal remaining
            </Text>
          </View>

          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>PROTEIN</Text>

            <ProgressCircle value={totalProtein} goal={proteinGoal} unit="g" />

            <Text style={styles.remainingText}>
              {Math.max(proteinGoal-totalProtein, 0).toFixed(1)}g remaining
            </Text>
          </View>
        </View>
        
        {extraRings.length > 0 && (
          <View style={styles.extraSection}>
            <Text style={styles.extraTitle}>
              ADDITIONAL NUTRITION
            </Text>

            <View style={styles.extraGrid}>
              {extraRings.map((nutrient) => {
                const hasGoal = 
                  nutrient.goal !== null &&
                  Number.isFinite(nutrient.goal) &&
                  nutrient.goal > 0;

                const overLimit = hasGoal && nutrient.isLimit && nutrient.goal !== null && nutrient.total > nutrient.goal;

                return(
                  <View 
                    key={nutrient.key}
                    style={styles.extraCard}
                  >
                    <Text style={styles.extraLabel}>
                      {nutrient.label}
                    </Text>

                    {hasGoal && nutrient.hasData  && nutrient.goal !== null ? (
                      <ProgressCircle
                        value={nutrient.total}
                        goal={nutrient.goal}
                        unit={nutrient.unit}
                        size={78}
                        compact
                        color={
                          overLimit ? "#D9534F" : nutrient.color
                        }
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.extraPlaceholder}
                        disabled={hasGoal}
                        onPress={() => router.push("/(drawer)/settings")}
                      >
                        <Text style={styles.placeholderText}>
                          {hasGoal ? "N/A" : "Set goal"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <Text style={styles.extraValues}>
                      {!hasGoal ? "No goal set" : !nutrient.hasData ? `N/A / ${nutrient.goal} ${nutrient.unit}`
                        : `${Number(nutrient.total.toFixed(1))} / ${nutrient.goal} ${nutrient.unit}`}
                    </Text>

                    <Text style={styles.extraNote}>
                      {nutrient.missingCount > 0 ? "Partial data" : !hasGoal ? "Configure in Settings" 
                        : overLimit ? "Over limit" : nutrient.isLimit ? "Daily Limit" : "Daily Goal"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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


  extraSection: {
    marginBottom: 28,
  },

  extraTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777",
    marginBottom: 14,
  },

  extraGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  extraCard: {
    width: "31%",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    minHeight: 154,
  },

  extraLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  extraValues: {
    fontSize: 11,
    color: "#555",
    marginTop: 9,
    textAlign: "center",
  },

  extraNote: {
    fontSize: 10,
    color: "#888",
    marginTop: 5,
    textAlign: "center",
  },

  extraPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "600",
  },
});