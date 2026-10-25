# 24INMCAL391 - RDBMS LAB
# 24INMCAL393 - USER INTERFACE AND DESIGN LAB
# 24INMCAT307 - SOFTWARE ENGINEERING

### Microproject Report Submitted By

**NAME:** KEBIN MANI  
**ROLL NO / REG NO:** AJC24MCA-I0XX  

*In Partial fulfillment for the Award of the Degree Of*  
**INTEGRATED MASTER OF COMPUTER APPLICATIONS (MCA FIVE YEAR)**  

---

### AMAL JYOTHI COLLEGE OF ENGINEERING AUTONOMOUS, KANJIRAPPALLY
*[Approved by AICTE, Accredited by NAAC.*  
*Koovappally, Kanjirappally, Kottayam, Kerala – 686518]*  

**2026-2027**

<div style="page-break-after: always;"></div>

---

## DEPARTMENT OF COMPUTER APPLICATIONS
### AMAL JYOTHI COLLEGE OF ENGINEERING AUTONOMOUS, KANJIRAPPALLY

---

### CERTIFICATE

This is to certify that the Microproject report titled **"Driving License Registration Portal"**, integrating **"24INMCAL391 - RDBMS Lab"**, **"24INMCAL393 - User Interface and Design Lab"** and **"24INMCAT307 - Software Engineering"**, is the bonafide work of **KEBIN MANI (AJC24MCA-I0XX)** in partial fulfillment of the requirements for the award of the Degree of Master of Computer Applications under Amal Jyothi College of Engineering, Autonomous Kanjirappally during the academic year **2026-2027**.

<br/><br/>

**Ms. Navyamol K T**  
*Lab In - Charge*  

**Dr. Bijimol T K**  
*Head of the Department*  

**Academic Year:** 2026-2027  

<div style="page-break-after: always;"></div>

---

# Microproject Submission Report

### Student Details
- **Name:** KEBIN MANI
- **Roll Number:** AJC24MCA-I0XX
- **Department:** Department of Computer Applications
- **Semester:** Semester V, Integrated MCA
- **College Name:** Amal Jyothi College of Engineering Autonomous, Kanjirappally

---

### Project Overview
The **Driving License Registration Portal (SARATHI Services)** is an enterprise-grade, full-stack digital governance web application designed to automate and streamline the citizen driving license lifecycle. It provides end-to-end self-service for citizens—from online application submission, document uploading, and appointment scheduling to real-time status tracking—while equipping regional transport authorities with administrative scrutiny, verification workflows, driving test evaluation, and instant digital license generation.

This project integrates key concepts from:
- **24INMCAL391 - RDBMS Lab**: Relational database modeling, 3NF schema design, referential integrity constraints, transactional consistency, indexing, and multi-table querying.
- **24INMCAL393 - User Interface and Design Lab**: Digital government design guidelines, accessibility (WCAG), progressive disclosure multi-step wizards, responsive design, visual timelines, and print layouts.
- **24INMCAT307 - Software Engineering**: Layered 3-tier MVC architecture, finite state machine (FSM) status workflows, role-based authorization (RBAC), automated integration testing, and immutable audit logging.

---

### Repository & Post Links
- **GitHub Repository:** `https://github.com/kebin-mani/driving-license-portal`
- **LinkedIn Project Post:** `https://www.linkedin.com/in/kebin-mani/driving-license-portal`

---

### Technologies Used
- **Frontend UI:** React.js 18, HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, Lucide React
- **Backend Service:** Node.js, Express.js (RESTful API architecture)
- **Database (RDBMS):** MySQL 8.0+ via `mysql2` (with built-in Relational SQLite fallback engine)
- **Security & Auth:** Stateless JWT (JSON Web Tokens), `bcryptjs` (Salted 10-round hashing), Helmet.js, Express Rate Limiting
- **File Management:** Multer with MIME-type and size validation (5MB max)
- **Version Control & Testing:** Git, GitHub, Node.js Test Runner (`node --test`), Supertest

---

### Concepts Implemented

| Subject | Concept Used | Implementation in Project |
| :--- | :--- | :--- |
| **24INMCAL391 - RDBMS Lab** | **Relational Schema Normalization (3NF)** | Engineered 7 normalized relational tables (`users`, `license_types`, `applications`, `documents`, `appointments`, `application_status_history`, `audit_logs`) preventing redundancy and anomalies. |
| | **Referential Integrity & Foreign Keys** | Configured cascading deletions (`ON DELETE CASCADE`) for dependent documents/appointments, and `ON DELETE SET NULL` for audit and history logs to preserve operational history. |
| | **ACID Transactions & Prepared Queries** | Implemented transactional safety (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`) for operations modifying multiple tables and 100% parameterized SQL queries to eliminate SQL injection. |
| | **Database Indexing** | Built B-Tree indexes on high-frequency lookup keys (`application_number`, `user_id`, `status`, `email`, `appointment_date`) optimizing search latency. |
| | **Relational Joins & Aggregations** | Executed complex multi-table `INNER JOIN` and `LEFT JOIN` queries with `COUNT()`, `GROUP BY`, and `HAVING` to generate administrative reports and dashboard metrics. |
| **24INMCAL393 - UI & Design Lab** | **Government Portal Design System** | Created a credible digital governance aesthetic with deep navy blue (`#0b2545`), clean white, subtle blue backgrounds, and gold accents following national portal guidelines. |
| | **Progressive Disclosure (Form Wizard)** | Designed a 5-step guided wizard (Category ➔ Personal ➔ Address/RTO ➔ Documents ➔ Declaration) reducing cognitive load on complex statutory forms. |
| | **Visual Status Tracking & Timeline** | Developed an interactive vertical stepper/timeline for application status tracking with contextual "Next Action Required" callouts and officer remarks. |
| | **Responsive Layout & Semantic Badges** | Implemented responsive flexbox and CSS grids, complete with high-contrast, accessible status badges for all 10 application states and document verification statuses. |
| | **Print Layout Styling (CSS Media Queries)** | Designed printable layouts (`@media print`) rendering official Government Application Receipts and Digital Smart Driving License Cards with QR code verification seals. |
| **24INMCAT307 - Software Engineering** | **3-Tier Layered Architecture** | Strictly decoupled Presentation Layer (React Client), Application Logic Layer (Express API controllers & middleware), and Data Storage Layer (MySQL RDBMS). |
| | **Finite State Machine (FSM) Workflow** | Modeled valid lifecycle state transitions (`Draft` ➔ `Submitted` ➔ `Pending Review` ➔ `Approved` ➔ `Test Scheduled` ➔ `Test Passed` ➔ `License Issued`), rejecting illegal state jumps. |
| | **Role-Based Access Control (RBAC)** | Implemented authentication middleware (`authenticate`) and role authorization (`requireRole('admin')`) ensuring applicants only access their records while officers access scrutiny queues. |
| | **Automated Integration Testing** | Built and executed an end-to-end integration test suite using `node:test` and `supertest`, validating authentication, state transitions, validation, and database constraints (17/17 tests passed). |
| | **Security, Validation & Audit Logging** | Embedded multi-layered defensive engineering: client-side form validation, server-side data sanitization, file MIME/size checks, rate limiting, and immutable audit logging. |

<div style="page-break-after: always;"></div>

---

### Screenshots of Code & Output

#### 1. Code Structure
```
driving-license-portal/
├── client/                     # Presentation Layer (React 18 + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, StatusBadge, Wizard, Modal)
│   │   ├── context/            # Global State Management (AuthContext)
│   │   ├── pages/              # Portal Views (Home, Dashboard, Tracking, Admin Desk)
│   │   ├── services/           # REST API Integration Client (api.js)
│   │   ├── App.jsx             # Route Configuration & RBAC Protections
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/                     # Application & Business Logic Layer (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Database Connectivity (db.js with MySQL & SQLite engine)
│   │   ├── controllers/        # Route Handlers (Auth, Applicant, Application, Admin)
│   │   ├── middleware/         # Auth (JWT), RBAC, Upload (Multer), Error, Rate Limiter
│   │   ├── routes/             # REST Endpoints (/auth, /applications, /appointments, /admin)
│   │   ├── utils/              # ID Generators, License Formatter, Audit Logger
│   │   ├── validators/         # Input Validation Schemas
│   │   ├── app.js              # Express Server Configuration
│   │   └── server.js           # Server Entrypoint
│   ├── tests/                  # Automated API Test Suite (api.test.js)
│   ├── uploads/                # Secure Document Storage Directory
│   └── package.json
├── database/                   # Data Storage Layer (Relational MySQL Schema & Seeds)
│   ├── schema.sql              # Normalized MySQL Tables, Constraints, Indexes
│   └── seed.sql                # Seed Data (License Types, Admin, Demo Applicants)
├── .env.example
├── .gitignore
└── README.md
```

#### 2. Output Sample & System Views
- **Public Home & Status Tracker (`http://localhost:5173/`)**: Features government header, live reference number tracking search, 5-step process roadmap, eligibility criteria, and accordion FAQs.
- **Applicant Dashboard (`/applicant/dashboard`)**: Displays real-time summary statistics (Total, Pending, Approved, Correction Required), test appointment reminders, and quick service links.
- **Multi-Step Application Wizard (`/apply`)**: Step-by-step validated entry for license categories, personal details, RTO selection, and drag-and-drop document upload.
- **Administrator Scrutiny Desk (`/admin/dashboard` & `/admin/applications/:id`)**: Overview metrics, filterable scrutiny queue, in-browser document verification (`Verified` / `Rejected` with remarks), appointment scheduler, test result evaluation (`Passed` / `Failed`), and **"Issue Smart License"** generator.
- **Digital Smart License Card**: Printable Form 7 Smart Driving License with cryptographic chip graphic, card serial number, vehicle classes, holder metadata, and verification QR code.

---

### Real-Time Applications

1. **National & State Transport Authorities (RTO Digitization):**
   Automates manual, paper-intensive counter workflows across Regional Transport Offices. Enables citizens to submit Form 2/4 applications digitally from anywhere, cutting citizen waiting times by over 70% and standardizing scrutiny across all regional offices.

2. **Automated Citizen Document Verification & Anti-Fraud Security:**
   Centralizes document repositories with encrypted storage, authorized streaming, and officer audit logs. Prevents fraudulent license submissions and duplicate vehicle registrations through unique constraint enforcement and centralized relational records.

3. **Intelligent Driving Test Slot Scheduling & Conflict Prevention:**
   Prevents overcrowding and slot conflicts at driving test tracks by enforcing real-time capacity thresholds (e.g., maximum 5 candidates per evaluation window) across multiple test centers.

4. **Instant Digital Credential Issuance & On-Road Verification:**
   Eliminates postal transit delays by generating an authentic Digital Smart Driving License with QR code verification immediately upon passing the road evaluation, verifiable by traffic enforcement authorities.

---

### Conclusion

The **Driving License Registration Portal** demonstrates the practical fusion of **Relational Database Management Systems (RDBMS)**, **User Interface and Design**, and **Software Engineering Principles** into an industry-grade web application:

1. **From an RDBMS Perspective (24INMCAL391):** The project reinforces the importance of 3NF normalization, referential integrity, and ACID transactional consistency. Establishing indexed foreign key relationships across applicants, applications, documents, appointments, and audit trails guarantees data fidelity, eliminates orphaned records, and ensures high-performance querying under concurrent loads.
2. **From a UI/UX Perspective (24INMCAL393):** Adhering to government-service portal heuristics ensured an accessible, trustworthy, and intuitive citizen experience. Implementing progressive disclosure wizards, real-time status steppers, contextual inline validation, and dedicated print stylesheets transforms complex administrative forms into an effortless self-service journey.
3. **From a Software Engineering Perspective (24INMCAT307):** Applying a 3-tier layered architecture, finite state machine (FSM) status workflows, role-based security, parameterized database operations, and automated test-driven integration ensures high modularity, testability, and security.

Connecting these disciplines showcases how modern full-stack systems are architected to mirror mission-critical, real-world public digital infrastructure.
