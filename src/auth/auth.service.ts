import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(username: string, password: string) {
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    const user = await this.usersService.createUser({
      username,
      password: hashedPassword,
    });

    return {
      id: user.id,
      username: user.username,
      message: "User registered successfully",
    };
  }

  async login(username: string, password: string) {
    // Find user by username
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Compare password with hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return token with correct field name
    return { accessToken };
  }

  async validateUser(userId: number) {
    return this.usersService.findById(userId);
  }
}

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mysql";
import { Connection } from "mysql2/promise";

@Injectable()
export class UsersService {
  constructor(@InjectConnection() private connection: Connection) {}

  async createUser(userData: { username: string; password: string }) {
    const [result] = await this.connection.execute(
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
    const [rows] = await this.connection.execute(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username]
    );

    const users = rows as any[];
    return users.length > 0 ? users[0] : null;
  }

  async findById(id: number) {
    const [rows] = await this.connection.execute(
      "SELECT id, username, role FROM users WHERE id = ?",
      [id]
    );

    const users = rows as any[];
    return users.length > 0 ? users[0] : null;
  }

  async findAll() {
    const [rows] = await this.connection.execute(
      "SELECT id, username, role, created_at FROM users"
    );
    return rows;
  }
}
