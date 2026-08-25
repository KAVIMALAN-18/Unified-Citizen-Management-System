# Unified Citizen Management System (UCMS) - Spring Boot Backend

Backend service for the Unified Citizen Management System (UCMS) developed with Spring Boot 3, Spring Data JPA, Spring Security, BCrypt, and JWT.

---

## 🛠️ Technology Stack

- **Java**: 21 LTS
- **Framework**: Spring Boot 3.3.3 (Spring Web, Spring Data JPA, Spring Security, Bean Validation)
- **Database**: PostgreSQL Cloud (via JPA / Hibernate)
- **Authentication**: JWT (JSON Web Tokens) with HMAC-SHA256 & BCrypt Password Hashing
- **Build Tool**: Maven

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── ucms/
│   │   │           ├── UcmsApplication.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   └── HealthController.java
│   │   │           ├── dto/
│   │   │           │   ├── ApiResponse.java
│   │   │           │   ├── AuthResponse.java
│   │   │           │   ├── CitizenDto.java
│   │   │           │   ├── CitizenLoginRequest.java
│   │   │           │   └── CitizenRegisterRequest.java
│   │   │           ├── exception/
│   │   │           │   ├── EmailAlreadyExistsException.java
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   └── InvalidCredentialsException.java
│   │   │           ├── model/
│   │   │           │   ├── Citizen.java
│   │   │           │   ├── Gender.java
│   │   │           │   └── Role.java
│   │   │           ├── repository/
│   │   │           │   └── CitizenRepository.java
│   │   │           ├── security/
│   │   │           │   ├── JwtService.java
│   │   │           │   └── SecurityConfig.java
│   │   │           └── service/
│   │   │               └── AuthService.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── ucms/
│       │           ├── AuthControllerTest.java
│       │           ├── AuthServiceTest.java
│       │           └── UcmsApplicationTests.java
│       └── resources/
│           └── application.properties
├── pom.xml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create your environment configuration or export the variables in your shell before launching the backend:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DB_URL` | JDBC URL for PostgreSQL Cloud instance | `jdbc:postgresql://<host>:5432/<dbname>?sslmode=require` |
| `DB_USERNAME` | PostgreSQL database user | `your_user` |
| `DB_PASSWORD` | PostgreSQL database password | `your_secret_password` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Minimum 32-character string |
| `PORT` | Server listening port (default `8080`) | `8080` |
| `JWT_EXPIRATION_MS`| Token expiration in milliseconds (default `86400000` = 24h) | `86400000` |

---

## 🚀 Running the Backend

### 1. Compile and Run Tests
```powershell
mvn clean test
```

### 2. Run the Application
With environment variables exported:

```powershell
$env:DB_URL="jdbc:postgresql://<host>:5432/<dbname>?sslmode=require"
$env:DB_USERNAME="<username>"
$env:DB_PASSWORD="<password>"
$env:JWT_SECRET="<your_jwt_secret_key_at_least_32_characters_long>"
mvn spring-boot:run
```

---

## 📡 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response** (`200 OK`):
```json
{
  "status": "ok",
  "service": "UCMS Backend"
}
```

### 2. Citizen Registration
- **Endpoint**: `POST /api/auth/citizen/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "fullName": "Kavimalan",
  "email": "kavi@example.com",
  "phoneNumber": "9876543210",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "dateOfBirth": "2005-06-15",
  "gender": "MALE",
  "address": "Example Address",
  "village": "Melur",
  "occupation": "Agriculture",
  "annualIncome": 83884.00,
  "landArea": 1.05,
  "farmerStatus": true
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Citizen registered successfully",
  "citizen": {
    "id": 1,
    "fullName": "Kavimalan",
    "email": "kavi@example.com",
    "phoneNumber": "9876543210",
    "dateOfBirth": "2005-06-15",
    "gender": "MALE",
    "address": "Example Address",
    "village": "Melur",
    "occupation": "Agriculture",
    "annualIncome": 83884.00,
    "landArea": 1.05,
    "farmerStatus": true,
    "role": "CITIZEN"
  }
}
```

### 3. Citizen Login
- **Endpoint**: `POST /api/auth/citizen/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "kavi@example.com",
  "password": "Password@123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "citizen": {
    "id": 1,
    "fullName": "Kavimalan",
    "email": "kavi@example.com",
    "role": "CITIZEN"
  }
}
```

---

## 🔒 Security Features
- **BCrypt Password Hashing**: Passwords are never stored or logged in plain text.
- **Role Enforcement**: All registrations automatically assign the `CITIZEN` role.
- **JWT Authorization**: Claims contain `citizenId`, `email`, and `role`.
- **CORS Support**: Pre-configured for `http://localhost:3000` and `http://localhost:5173`.
- **Input Validation**: Jakarta Bean Validation on all fields with custom standardized error responses.
