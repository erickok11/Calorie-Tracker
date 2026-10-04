import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export type FoodRow = {
    id: number;
    name: string;
    amount: number | null;
    unit: string | null;
    calories: number;
    protein: number;
    date: string;
};

export type settingsRow = {
    id: number;
    calorie_goal: number;
    protein_goal: number;
};

export type DailySummaryRow = {
    date: string;
    total_calories: number;
    total_protein: number;
    calorie_goal: number;
    protein_goal: number;
}

export type DailyGoal = {
    date: string;
    calorie_goal: number;
    protein_goal: number;
}

export function getLocalDate(){
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2,"0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
export async function initializeDatabase() {
    db = await SQLite.openDatabaseAsync(
        "calorieTracker.db"
    );

    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL,
            unit TEXT,
            calories REAL NOT NULL,
            protein REAL NOT NULL,
            date TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY NOT NULL,
            calorie_goal REAL NOT NULL,
            protein_goal REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS daily_goals (
            date TEXT PRIMARY KEY NOT NULL,
            calorie_goal REAL NOT NULL,
            protein_goal REAL NOT NULL
        );
        `
    );

    await db.runAsync(
        `INSERT OR IGNORE INTO settings
         (id, calorie_goal, protein_goal)
         VALUES (1, 1800, 140)
        `
    );


    return db;
}

export async function getDatabase() {
    if (db == null){
        return await initializeDatabase();
    }

    return db;
}

export async function insertFood(
    name: string,
    amount: number | undefined,
    unit: string | undefined,
    calories: number,
    protein: number,
    date: string
){
    const database = await getDatabase();

    const result = await database.runAsync(
        `INSERT INTO foods
            (name, amount, unit, calories, protein, date)
            VALUES (?, ?, ?, ?, ?, ?)`,
        name,
        amount ?? null,
        unit ?? null,
        calories,
        protein,
        date
    );

    return result;
}



export async function getFoodsByDate(date: string) {
    const database = await getDatabase();
    
    const foods = await database.getAllAsync<FoodRow>(
        `SELECT *
        FROM foods
        WHERE date = ?
        ORDER BY id ASC`,
        date
    );

    return foods;
}

export async function deleteFoodById(id: number){
    const database = await getDatabase();

    await database.runAsync(
        "DELETE FROM foods WHERE id = ?",
        id
    );
}

export async function updateFoodById(
    id:number,
    name:string,
    amount: number | undefined,
    unit: string | undefined,
    calories: number,
    protein: number,
){
    const datatbase = await getDatabase();

    await datatbase.runAsync(
        `UPDATE foods
        SET name = ?,
            amount = ?,
            unit = ?,
            calories = ?,
            protein = ?
        WHERE id = ?`,
        name,
        amount ?? null,
        unit ?? null,
        calories,
        protein,
        id
    );
}

export async function getSettings() {
    const database = await getDatabase();

    return await database.getFirstAsync<settingsRow>(
        "SELECT * FROM settings WHERE id = 1"
    );
}

export async function updateGoal(
    calorieGoal: number,
    proteinGoal: number
){
    const database = await getDatabase();
    
    await database.runAsync(
        `UPDATE settings
        SET calorie_goal = ?,
            protein_goal = ?
        WHERE id = 1`,
        calorieGoal,
        proteinGoal
    );
}

export async function getDailySummaries() {
    const database = await getDatabase();

    return await database.getAllAsync<DailySummaryRow>(
        `SELECT
            foods.date,
            SUM(foods.calories) AS total_calories,
            SUM(foods.protein) AS total_protein,
            daily_goals.calorie_goal,
            daily_goals.protein_goal
        FROM foods
        JOIN daily_goals
            ON foods.date = daily_goals.date
        GROUP BY foods.date
        ORDER BY foods.date DESC`
    );
}

export async function getDailyGoals(date: string) {
    const database = await getDatabase();

    return await database.getFirstAsync<DailyGoal>(
        `SELECT *
         FROM daily_goals
         WHERE date = ?`,
        date
    );
}

export async function ensureDailyGoals(
    date:string,
    calorieGoal: number,
    proteinGoal: number
){
    const database = await getDatabase();

    await database.runAsync(
        `INSERT OR IGNORE INTO daily_goals
        (date, calorie_goal, protein_goal)
        VALUES (?, ?, ?)`,
        date,
        calorieGoal,
        proteinGoal
    );
}

export async function updateDailyGoals(
    date:string,
    calorieGoal: number,
    proteinGoal: number,
){
    const database = await getDatabase();

    await database.runAsync(
        `INSERT INTO daily_goals
        (date, calorie_goal, protein_goal)
        VALUES (?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
            calorie_goal = excluded.calorie_goal
            protein_goal = excluded.protein_goal`,
        date,
        calorieGoal,
        proteinGoal,
    );
}


