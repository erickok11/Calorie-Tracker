import { calculateProgress } from "@/utils/nutrition";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type ProgressCircleProps = {
    value: number;
    goal: number;
    unit?: string;
    size?: number;
    color?: string;
    compact?: boolean;
};

export default function ProgressCircle({
    value,
    goal,
    unit = "",
    size = 120,
    color = "#3478F6",
    compact = false,
}: ProgressCircleProps){
    const strokeWidth = 10;

    const radius = (size - strokeWidth) /2;
    const circumference = 2 * Math.PI * radius;

    const validGoal = Number.isFinite(goal) && goal > 0;
    const validValue = Number.isFinite(value) && value >= 0;

    const progress = validGoal && validValue 
                        ? Math.min(Math.max(calculateProgress(value,goal), 0), 1) : 0;
    
    const percentage = validGoal && validValue ? Math.round((value/goal) * 100) : 0;

    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={[styles.container,{width:size, height:size,},]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/*Background circle*/}
                <Circle
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    stroke="#E8E8E8"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/*Progess circle */}
                <Circle
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            
            <View style={styles.textContainer}>
                {compact ? (
                    <Text style={styles.compactValue}>
                        {percentage}%
                    </Text>
                ):
                <>
                    <Text style={styles.value}>
                        {value}
                        {unit}
                    </Text>

                    <Text style={styles.goal}>
                        / {goal}
                        {unit}
                    </Text>
                </>
                
                }
                
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },

    svg: {
        position: "absolute",
    },

    textContainer: {
        alignItems: "center",
    },

    value: {
        fontSize: 23,
        fontWeight: "700",
    },

    goal: {
        fontSize: 12,
        color: "#777",
        marginTop: 2,
    },

    compactValue: {
        fontSize: 15,
        fontWeight: "700",
    }
});