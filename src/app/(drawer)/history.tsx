import { useCallback, useState } from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect, useNavigation } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";

import { 
    type DailySummaryRow, 
    type FoodRow,
    type DashboardNutrient,
    getFoodsByDate,
    getDailySummaries,
    
} from "@/database/database";

import { formatDateForDatabase, getDaysInMonth } from "@/utils/date";
import { getGoalStatus } from "@/utils/goals";

import Svg, { Circle } from "react-native-svg";

import ProgressCircle from "@/components/ProgressCircle";

const EXTRA_NUTRIENTS: {
    key: DashboardNutrient;
    label: string;
    unit: string;
}[] = [
    { key: "carbs", label: "Carbohydrates", unit: "g"},
    { key: "fat", label: "Fat", unit: "g"},
    { key: "sugar", label: "Sugar", unit: "g"},
    { key: "fiber", label: "Fiber", unit: "g"},
    { key: "sodium_mg", label: "Sodium", unit: "mg"},
];

export default function HistoryScreen() {
    const navigation = useNavigation();
    
    const [days, setDays] = useState<DailySummaryRow[]>([]);

    const [currentMonth, setCurrentMonth] = useState(
        new Date()
    );

    const [selectedDayFoods, setSelectedDayFoods] = useState<{ date: string; rows: FoodRow[];} | null>(null);

    const [foodLoadErrorDate, setFoodLoadErrorDate] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>(
        formatDateForDatabase(new Date())
    );

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            let active = true;

            setSelectedDayFoods(null);
            setFoodLoadErrorDate(null);

            const loadSelectedDay = async () => {
                try {
                    const rows = await getFoodsByDate(selectedDate);

                    if(active) {
                        setSelectedDayFoods({
                            date: selectedDate,
                            rows,
                        });
                    }
                } catch(error) {
                    console.error(
                        "Failed to load historical nutrition:",
                        error
                    );

                    if(active){
                        setFoodLoadErrorDate(selectedDate);
                    }
                }
            };

            void loadSelectedDay();

            return () => {
                active = false;
            };
        }, [selectedDate])
    );

    const loadHistory = async () => {
        const results = await getDailySummaries();
        setDays(results);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth()-1,
                1
            )
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth()+1,
                1
            )
        );
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(
        year,
        month,
        1
    ).getDay();

    const numberOfDays = getDaysInMonth(year, month);

    const calendarDays: (number | null)[] = [];

    for (let i = 0;i < firstDayOfMonth;i ++){
        calendarDays.push(null);
    }

    for (let day = 1;day <= numberOfDays; day++){
        calendarDays.push(day);
    }

    const getSummaryForDay = (day:number) => {
        const date = formatDateForDatabase(
            new Date(year, month, day)
        );

        return days.find(
            (summary) => summary.date === date
        );
    };

    const isCurrentMonth =
        currentMonth.getFullYear() === new Date().getFullYear() &&
        currentMonth.getMonth() === new Date().getMonth();

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

                    <Text style={styles.title}>History</Text>

                    <View style={styles.headerSpacer} />

                </View>

                
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={goToPreviousMonth}>
                        <Text style={styles.monthArrow}>‹</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.monthTitle}>
                        {currentMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>

                    <TouchableOpacity 
                        onPress={goToNextMonth}
                        disabled={isCurrentMonth}
                    >
                        <Text style={[
                            styles.monthArrow,
                            isCurrentMonth && styles.disabledArrow,
                        ]}>›</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.weekRow}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <Text 
                                key={day}
                                style={styles.weekDay}
                            >
                                {day}
                            </Text>
                        )
                    )}
                </View>

                <View style={styles.calendarGrid}>
                    {calendarDays.map((day,index)=> {
                        if(day === null) {
                            return (
                                <View
                                    key={`empty-${index}`}
                                    style={styles.dayCell}
                                />
                            );
                        }

                        const summary = getSummaryForDay(day);

                        const status = summary
                            ? getGoalStatus(
                                summary.total_calories,
                                summary.total_protein,
                                summary.calorie_goal,
                                summary.protein_goal
                            )
                        :undefined;

                        const date = formatDateForDatabase(
                            new Date(year, month, day)
                        );


                        const cellDate = new Date(year, month, day);
                        const today = new Date();

                        cellDate.setHours(0,0,0,0);
                        const isFuture = cellDate > today;

                        return (
                            <TouchableOpacity
                                key={date}
                                style={styles.dayCell}
                                onPress={() => setSelectedDate(date)}
                            >
                                {summary ? (
                                    <DayRing
                                        day={day}
                                        status={status}
                                        selected={selectedDate === date}
                                    />
                                ) : isFuture ? (
                                    <View style={styles.emptyDay}>
                                        <Text style={styles.dayNumber}>
                                            {day}
                                        </Text>
                                    </View>
                                ) : (
                                    <DayRing
                                        day={day}
                                        selected={selectedDate===date}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>


                {selectedDate && (()=> {
                    const summary = days.find(
                        (day) => day.date === selectedDate
                    );

                    return (
                        <View style={styles.selectedSummary}>
                            <Text style={styles.selectedDate}>
                                {new Date(
                                    `${selectedDate}T12:00:00`
                                ).toLocaleDateString("en-US", {
                                    weekday:"long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>

                            {summary ? (
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryGoal}>
                                        <Text style={styles.summaryTitle}>
                                            CALORIES
                                        </Text>

                                        <ProgressCircle
                                            value={Math.round(summary.total_calories)}
                                            goal={summary.calorie_goal}
                                        />
                                    </View>

                                    <View style={styles.summaryGoal}>
                                        <Text style={styles.summaryTitle}>
                                            PROTEIN
                                        </Text>

                                        <ProgressCircle
                                            value={Number(summary.total_protein.toFixed(1))}
                                            goal={summary.protein_goal}
                                            unit="g"
                                        />
                                    </View>
                                </View>
                            ):(
                                <Text style={styles.noData}>
                                    No food logged on this day.
                                </Text>
                            )}

                            {summary && (
                                <View style={styles.extraNutritionSection}>
                                    <Text style={styles.extraNutritionTitle}>
                                        ADDITIONAL NUTRITION
                                    </Text>

                                    {foodLoadErrorDate === selectedDate ? (
                                        <Text style={styles.extraNutritionNote}>
                                            Unable to load nutrition details.
                                        </Text>
                                    ) : selectedDayFoods?.date !== selectedDate ? (
                                        <Text style={styles.extraNutritionNote}>
                                            Loading Nutrition...
                                        </Text>
                                    ) : (
                                        EXTRA_NUTRIENTS.map((nutrient, index) => {
                                            const foods = selectedDayFoods.rows;

                                            const knowValues = foods.map((food)=> food[nutrient.key])
                                                                    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
                                            
                                            const missingCount = foods.length - knowValues.length;

                                            const total = knowValues.reduce(
                                                (sum, value) => sum + value,
                                                0
                                            );

                                            const formattedValue = knowValues.length === 0 ? "N/A" : `${Number(total.toFixed(1))} ${nutrient.unit}`
                                            
                                            return (
                                                <View key={nutrient.key}>
                                                    {index > 0 && (
                                                        <View style={styles.extraNutritionDivider}/>
                                                    )}

                                                    <View style={styles.extraNutritionRow}>
                                                        <Text style={styles.extraNutritionLabel}>
                                                            {nutrient.label}
                                                        </Text>

                                                        <View style={styles.extraNutritionRight}>
                                                            <Text style={styles.extraNutritionValue}>
                                                                {formattedValue}
                                                            </Text>

                                                            {missingCount > 0 && (
                                                                <Text style={styles.extraNutritionNote}>
                                                                    {knowValues.length === 0
                                                                     ? "Not recorded"
                                                                     : "Partial data"}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                            )
                                        })
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })()}
            </ScrollView>
        </SafeAreaView>
    )
}


type DayRingProps = {
    day: number;
    status?: "complete" | "partial" | "incomplete";
    selected?: boolean;
};

function DayRing({
    day,
    status,
    selected = false,
}: DayRingProps) {
    const size = 42;
    const strokeWidth = selected ? 4 : 3;

    let ringColor = "#D1D1D1";

    if(status === "complete"){
        ringColor = "#34C759";
    } else if(status === "partial"){
        ringColor = "#FFCC00";
    } else if(status === "incomplete"){
        ringColor = "#ff3B30"
    }

    return (
        <View
            style={[
                styles.dayRingContainer,
                selected && styles.selectedDay,
            ]}
        >
            <Svg
                width={size}
                height={size}
                style={StyleSheet.absoluteFill}
            >
                <Circle
                    cx={size/2}
                    cy={size/2}
                    r={(size-strokeWidth)/2}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            </Svg>

            <Text style={styles.dayNumber}>
                {day}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },

    content: {
        padding: 24,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },

    menuButton: {
        width:44,
        height:44,
        justifyContent: "center",
    },

    menuIcon: {
        fontSize: 25,
        fontWeight: "600",
    },

    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "700",
    },

    headerSpacer: {
        width:44,
    },

    dayCard: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
    },

    dateText: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 16,
    },

    emptyText: {
        textAlign: "center",
        color: "#777",
        marginTop: 50,
    },

    monthHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    monthTitle: {
        fontSize: 20,
        fontWeight: "700",
    },

    monthArrow: {
        fontSize: 32,
        color: "#3478F6",
        paddingHorizontal: 10,
    },

    weekRow: {
        flexDirection: "row",
        marginBottom: 10,
    },

    weekDay: {
        width: "14.2857%",
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#777",
    },

    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    dayCell: {
        width: "14.2587%",
        height: 52,
        justifyContent: "center",
    },

    dayNumber: {
        fontSize: 14,
        fontWeight: "600",
    },

    selectedSummary: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 20,
        marginTop: 25,
    },

    selectedDate: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 18,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    summaryGoal: {
        flex:1,
        alignItems: "center",
    },

    summaryTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#777",
        marginBottom: 12,
        letterSpacing: 0.5,
    },

    summaryLabel:{
        fontSize: 12,
        color: "#777",
        marginBottom: 4,
    },

    summaryValue: {
        fontSize: 17,
        fontWeight: "600",
    },

    noData:{
        color: "#777"
    },

    emptyDay: {
        width: 42,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
    },

    selectedEmptyDay: {
        backgroundColor: "#E5E5EA",
        borderRadius: 21,
    },

    dayRingContainer: {
        width: 42,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
    },

    selectedDay: {
        backgroundColor: "#E5E5EA",
        borderRadius: 21,
    },

    disabledArrow: {
        opacity: 0.25,
    },

    extraNutritionSection: {
        marginTop: 26,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },

    extraNutritionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#777",
        letterSpacing: 0.5,
        marginBottom: 16,
    },

    extraNutritionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },

    extraNutritionLabel: {
        fontSize: 15,
        color: "#555",
    },

    extraNutritionRight: {
        alignItems: "flex-end",
        flexShrink: 1,
    },

    extraNutritionValue: {
        fontSize: 15,
        fontWeight: "600",
    },

    extraNutritionNote: {
        fontSize: 11,
        color: "#999",
        marginTop: 3,
    },

    extraNutritionDivider: {
        height: 1,
        backgroundColor: "#EEE",
        marginVertical: 10,
    },

});
