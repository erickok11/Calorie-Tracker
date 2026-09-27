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


