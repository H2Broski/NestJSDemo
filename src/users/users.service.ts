import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(userData: { username: string; password: string }) {
    const pool = this.databaseService.getPool();
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [userData.username, userData.password, "user"]
    );

    return {
      id: (result as any).insertId,
      username: userData.username,
      role: "user",
    };
  }

  async findByUsername(username: string) {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.execute(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username]
    );

    const users = rows as any[];
    return users.length > 0 ? users[0] : null;
  }

  async findById(id: number) {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.execute(
      "SELECT id, username, role FROM users WHERE id = ?",
      [id]
    );

    const users = rows as any[];
    return users.length > 0 ? users[0] : null;
  }

  async findAll() {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.execute(
      "SELECT id, username, role, created_at FROM users"
    );
    return rows;
  }

  async create(userData: any) {
    return this.createUser(userData);
  }

  async getAll() {
    return this.findAll();
  }

  async getOne(id: number) {
    return this.findById(id);
  }

  async updateUser(id: number, userData: any) {
    const pool = this.databaseService.getPool();
    await pool.execute(
      "UPDATE users SET username = ?, password = ? WHERE id = ?",
      [userData.username, userData.password, id]
    );
    return { id, ...userData };
  }

  async deleteUser(id: number) {
    const pool = this.databaseService.getPool();
    await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    return { message: "User deleted" };
  }
}
