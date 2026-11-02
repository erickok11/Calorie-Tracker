import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { MealGroup } from "@/utils/meals";
import { calculateTotalCalories } from "@/utils/nutrition";

type SectionFood = {
    id: string | number;
    name: string;
    calories: number;
    protein: number;
    meal?: string | null;
};

type Props<T extends SectionFood> = {
    group: MealGroup<T>;
    onPressFood: (food: T) => void;
    onAdd?: () => void;
};

export default function MealSection<T extends SectionFood>({
    group,
    onPressFood,
    onAdd,
}: Props<T>) {
    const calories = calculateTotalCalories(group.foods);

    return(
        <View style={styles.section}>
            <View style={styles.header}>
                <Text style={styles.title}>{group.label.toUpperCase()}</Text>
                <Text style={styles.total}>{Math.round(calories)} kcal</Text>
            </View>

            <View style={styles.card}>
                {group.foods.length === 0 && (
                    <Text style={styles.empty}>Nothing logged yet</Text>
                )}

                {group.foods.map((food, index) => (
                    <View key={food.id}>
                        {index > 0 && <View style={styles.divider} />}
                        
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => onPressFood(food)}
                        >
                            <View style={styles.rowText}>
                                <Text style={styles.name}>{food.name}</Text>
                                <Text style={styles.info}>
                                    {Math.round(food.calories)} kcal ·{" "}
                                    {Number(food.protein.toFixed(1))} g protein
                                </Text>
                            </View>

                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {onAdd && (
                    <TouchableOpacity style={styles.addRow} onPress={onAdd}>
                        <Text style={styles.addText}>+ Add to {group.label}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, paddingHorizontal: 4,},
    title: { fontSize: 13, fontWeight: "600", color: "#777"},
    total: { fontSize: 13, color: "#777"},
    card: { backgroundColor: "white", borderRadius: 16, paddingHorizontal: 18},
    empty: { color: "#AAA", paddingVertical: 16},
    divider: { height: 1, backgroundColor: "#EEE" },
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 14},
    rowText: { flex: 1},
    name: { fontSize: 17, fontWeight: "600" },
    info: { color: "#777", marginTop: 4},
    chevron: { fontSize: 22, color: "#C7C7CC"},
    addRow: { borderTopWidth: 1, borderTopColor: "#EEE", paddingVertical: 14},
    addText: { color: "#3478F6", fontSize: 16, fontWeight: "600"},
});