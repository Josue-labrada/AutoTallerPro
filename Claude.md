AutoTaller Pro — Claude Code Project Instructions

1. Project Overview

Project: AutoTaller Pro
Type: B2B/B2C Automotive Workshop Management System
Architecture: Modular Monolith
Deployment: On-Premise
Repository: Public GitHub Repository
Development: Collaborative Team Project
Current Phase: Architecture and Initial Development

AutoTaller Pro is a web-based platform designed to digitize vehicle reception, diagnostics, repairs, work orders, and customer service tracking.

The project is developed as part of a Software Quality Engineering course.

The primary objective is to build a secure, maintainable, modular, and testable application following software engineering best practices.

Core Architectural Principles

* High Cohesion
* Low Coupling
* Separation of Concerns
* SOLID Principles
* Modular Architecture
* Security by Design
* Testability
* Maintainability
* Code Reusability

IMPORTANT: Do not introduce unnecessary architectural complexity.

Prefer simple, maintainable, and scalable solutions appropriate for a small development team.

⸻

2. Technology Stack

Frontend

* React
* TypeScript
* HTML5
* CSS3
* Interactive SVG components

Backend

* Node.js
* TypeScript
* REST API architecture

The backend framework has not yet been finalized.

Do not assume Express, NestJS, or another framework is approved unless it is already configured in the repository or explicitly authorized.

Database

* PostgreSQL

Object Storage

* MinIO

MinIO will be used only when image or file storage functionality is implemented.

Infrastructure

* Docker
* Docker Compose
* On-Premise Deployment

Version Control

* Git
* GitHub
* Feature Branch Workflow
* Pull Requests

AI-Assisted Development

* Claude Code
* ChatGPT
* Gemini

AI-generated code must always be reviewed before integration.

⸻

3. System Modules

The system is divided into two major functional areas.

3.1 Operational Module

Used by mechanics and workshop administrators.

Vehicle Registration

Responsibilities:

* Register vehicles.
* Store vehicle information.
* Validate registration data.
* Associate vehicles with work orders.

Expected information includes:

* License plate.
* Manufacturer.
* Model.
* Mileage.
* Reception date.

Interactive Vehicle Damage Mapping

Responsibilities:

* Display an interactive vehicle diagram.
* Allow mechanics to select affected vehicle areas.
* Record damage descriptions.
* Associate observations with work orders.
* Store relevant images when required.

Prefer SVG-based interaction for the initial implementation.

Do not introduce multithreading or complex rendering frameworks unless technically justified.

Kanban Work Order Management

Work orders must support the following states:

1. En Recepción
2. En Diagnóstico
3. En Reparación
4. Listo para Entrega

Responsibilities:

* Create work orders.
* Update work order status.
* Display work orders in Kanban columns.
* Persist status changes.
* Validate allowed state transitions.

Business rules must be implemented in the backend.

The frontend must not be the authoritative source of work order status.

Services and Costs

Responsibilities:

* Register services performed.
* Register materials and supplies.
* Calculate subtotals.
* Associate costs with work orders.

All monetary calculations must use appropriate decimal handling.

Avoid floating-point precision errors.

Fiscal invoicing is outside the initial project scope unless explicitly approved.

⸻

3.2 Customer Module

Vehicle Status Tracking

Customers can consult the current repair status of their vehicles.

Security requirements:

* Do not expose private information using only a license plate.
* Use secure tracking identifiers or authenticated access.
* Return only authorized information.
* Validate all user inputs.

Fuel Consumption Calculator

Responsibilities:

* Receive travel distance.
* Receive average fuel efficiency.
* Receive fuel price.
* Calculate estimated fuel consumption.
* Calculate estimated travel cost.

Reference formulas:

Fuel consumption:

liters = distance_km / efficiency_km_per_liter

Estimated cost:

total_cost = liters * fuel_price_per_liter

Validation requirements:

* Distance must be non-negative.
* Fuel efficiency must be greater than zero.
* Fuel price must be non-negative.
* Invalid inputs must be rejected.

This module must include automated unit tests.

Preventive Maintenance Alerts

Responsibilities:

* Retrieve maintenance information.
* Calculate upcoming maintenance requirements.
* Display visual alerts.

Alert colors:

* Green
* Yellow
* Red

Exact alert thresholds must be defined in the requirements documentation before implementation.

Do not invent maintenance intervals without approval.

⸻

4. Architecture Rules

4.1 Modular Monolith

The backend must initially follow a modular monolith architecture.

Each module should encapsulate its own business responsibilities.

Do not introduce microservices without explicit approval.

4.2 High Cohesion

Each module must focus on a specific business capability.

Avoid mixing:

* Database access with UI logic.
* Authentication with unrelated business rules.
* Fuel calculations with vehicle registration.
* File storage with work order calculations.

4.3 Low Coupling

Modules must communicate through clearly defined interfaces.

Avoid direct dependencies on internal implementation details of unrelated modules.

Use dependency injection when it provides meaningful architectural benefits.

Do not create unnecessary abstractions.

4.4 Separation of Responsibilities

Prefer the following logical layers:

* Routes
* Controllers
* Services
* Repositories
* Models
* Validation

Responsibilities:

Routes: Define API endpoints.

Controllers: Handle HTTP requests and responses.

Services: Implement business rules.

Repositories: Handle data persistence.

Models: Represent domain and persistence structures.

Validation: Validate incoming data.

Not every module requires every layer if doing so adds unnecessary complexity.

4.5 Database Access

Only the backend may access PostgreSQL directly.

The frontend must communicate with the backend through documented APIs.

Never expose database credentials to the frontend.

⸻

5. Repository Structure

Expected project organization:

AutoTaller-Pro/
├── .github/
│   └── workflows/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── vehicles/
│   │   │   ├── work-orders/
│   │   │   ├── kanban/
│   │   │   ├── fuel-calculator/
│   │   │   └── maintenance/
│   │   ├── middleware/
│   │   └── app/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── types/
│   └── tests/
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
│   ├── architecture/
│   │   └── sdd_arquitectura.md
│   ├── requirements/
│   │   └── requisitos.md
│   ├── quality/
│   │   └── rtm_calidad.md
│   └── api/
├── .gitignore
├── .env.example
├── AGENTS.md
├── CLAUDE.md
├── CONTRIBUTING.md
├── docker-compose.yml
└── README.md

This structure represents the target organization.

Do not assume that all directories or files already exist.

Create directories only when required by an approved implementation task.

⸻

6. Security Rules — CRITICAL

THIS IS A PUBLIC REPOSITORY.

Security must be considered before generating or modifying code.

Never Commit

* API keys.
* Access tokens.
* Database passwords.
* Private keys.
* Authentication secrets.
* Production credentials.
* Customer personal information.
* Private vehicle records.
* Real environment configuration files.
* Database backups containing sensitive data.

Environment Variables

Use environment variables for sensitive configuration.

Use .env.example for placeholder values only.

Never include real credentials in examples.

Database Security

* Use parameterized queries.
* Validate all inputs.
* Apply least-privilege permissions.
* Do not expose database connections publicly.
* Do not return sensitive database fields unnecessarily.

API Security

* Validate incoming requests.
* Implement authentication where required.
* Enforce authorization on protected resources.
* Avoid exposing internal errors.
* Never log passwords or access tokens.
* Apply appropriate rate limiting to public endpoints.

Frontend Security

* Do not store private credentials in frontend code.
* Do not expose backend secrets through build variables.
* Treat all user input as untrusted.
* Avoid unsafe HTML injection.

Security Incident Handling

If a secret is discovered:

1. Stop and identify the affected files.
2. Do not reproduce the secret unnecessarily.
3. Report the exposure.
4. Recommend immediate credential rotation.
5. Do not assume deleting the file removes it from Git history.

Never automatically rewrite Git history without explicit authorization.

⸻

7. Git and Collaboration Rules

The project is maintained by three developers.

Main Branches

main

Stable and reviewed code.

develop

Integration branch.

Development Branches

* feature/josue
* feature/alejandro
* feature/paulina

Additional feature-specific branches may be created when appropriate.

Git Rules

Never commit directly to main.

Never force-push without explicit authorization.

Never delete remote branches without approval.

Never overwrite another developer’s changes.

Never execute destructive Git operations without explicit permission.

Before making changes:

1. Check the current branch.
2. Check the working tree status.
3. Identify modified files.
4. Preserve unrelated changes.
5. Explain any potential conflicts.

Pull Requests

Every major change should be submitted through a pull request.

Pull requests should include:

* Description of changes.
* Affected modules.
* Tests performed.
* Known limitations.
* Security considerations.

Do not claim that a pull request has been reviewed or approved unless this has actually occurred.

⸻

8. Code Quality Standards

General Rules

* Write readable and maintainable code.
* Prefer descriptive variable names.
* Avoid duplicated business logic.
* Keep functions focused.
* Avoid unnecessary dependencies.
* Use consistent formatting.
* Handle errors explicitly.
* Validate external inputs.

TypeScript

* Prefer strict typing.
* Avoid any unless justified.
* Define clear interfaces and types.
* Avoid unnecessary type assertions.
* Handle nullable values safely.

React

* Prefer reusable components.
* Separate UI components from API access.
* Avoid unnecessary state duplication.
* Keep business calculations outside presentation components when appropriate.
* Follow established project conventions.

Backend

* Keep controllers lightweight.
* Implement business rules in services.
* Keep persistence logic separate.
* Validate API inputs.
* Return consistent HTTP responses.

Database

* Use migrations for schema changes.
* Define appropriate constraints.
* Maintain referential integrity.
* Avoid unnecessary database queries.
* Use transactions when multiple changes must succeed together.

⸻

9. Testing Requirements

Testing is a fundamental requirement of AutoTaller Pro.

Unit Tests

Prioritize:

* Fuel calculations.
* Cost calculations.
* Maintenance alert logic.
* Data validation.
* Work order state transitions.

Integration Tests

Verify:

* Backend and PostgreSQL communication.
* Work order persistence.
* Vehicle registration.
* Authentication and authorization.
* File storage when implemented.

Testing Rules

When modifying business logic:

1. Identify relevant test cases.
2. Add or update tests.
3. Include valid and invalid inputs.
4. Test boundary conditions.
5. Execute available tests when possible.
6. Report actual results.

Never claim tests passed without executing them.

Never remove failing tests merely to make the test suite appear successful.

If tests cannot be executed, explain why.

⸻

10. Quality Model

The project uses ISO/IEC 25010 as a reference for software quality evaluation.

Relevant characteristics include:

* Functional Suitability
* Performance Efficiency
* Compatibility
* Interaction Capability
* Reliability
* Security
* Maintainability
* Flexibility
* Safety

Quality characteristics must be connected to measurable requirements and verification activities.

The requirements traceability matrix is located at:

docs/quality/rtm_calidad.md

Do not claim compliance with ISO/IEC 25010 solely because the project references the standard.

⸻

11. Documentation Rules

The following documents provide project context:

README.md

General project information.

AGENTS.md

Shared instructions for AI-assisted development.

CLAUDE.md

Claude Code-specific project instructions.

docs/architecture/sdd_arquitectura.md

Architectural design documentation.

docs/requirements/requisitos.md

Functional and non-functional requirements.

docs/quality/rtm_calidad.md

Requirements traceability and quality verification.

Documentation Priority

When making implementation decisions:

1. Follow the current approved requirements.
2. Respect documented architectural decisions.
3. Follow established repository conventions.
4. Apply the instructions in this file.
5. Request clarification when important information is missing.

If documents contradict each other, identify the conflict instead of silently choosing an interpretation.

Keep documentation synchronized with approved implementation changes.

⸻

12. AI Development Workflow

Before generating code, Claude must:

1. Understand the requested functionality.
2. Identify the responsible module.
3. Inspect relevant existing files.
4. Review applicable architectural documentation.
5. Identify dependencies.
6. Consider security implications.
7. Propose a minimal implementation plan.

During implementation:

1. Follow existing code conventions.
2. Preserve unrelated functionality.
3. Implement one coherent change at a time.
4. Avoid unnecessary refactoring.
5. Add appropriate validation.
6. Add relevant tests.

After implementation:

1. Review modified files.
2. Execute available tests.
3. Identify potential regressions.
4. Report incomplete work.
5. Summarize architectural implications.
6. Suggest documentation updates when necessary.

Required Response Format

For development tasks, respond using the following structure when appropriate:

1. Objective

Explain what will be implemented.

2. Affected Files

Identify files to create or modify.

3. Implementation

Explain the technical changes.

4. Testing

Describe executed tests and their results.

5. Security

Identify relevant security considerations.

6. Next Steps

Explain what remains to be completed.

⸻

13. Avoid Unnecessary Complexity

AutoTaller Pro is an academic team project.

Prioritize maintainability and correctness over unnecessary sophistication.

Do not introduce the following without justification and approval:

* Microservices.
* Kubernetes.
* Distributed databases.
* Message brokers.
* Complex event-driven architectures.
* Additional cloud infrastructure.
* Unnecessary design patterns.
* Excessive abstraction layers.
* Unapproved external services.

The objective is not to maximize the number of technologies.

The objective is to build reliable software with clear architecture and measurable quality.

⸻

14. On-Premise Requirements

The system must support local deployment.

Development decisions should avoid mandatory dependencies on paid cloud services.

Docker Compose should eventually support:

* Frontend.
* Backend.
* PostgreSQL.
* MinIO, when required.

Infrastructure Rules

* Do not expose PostgreSQL directly to the public internet.
* Do not expose MinIO administrative interfaces publicly.
* Use persistent volumes where necessary.
* Define appropriate service dependencies and health checks.
* Keep secrets outside committed configuration files.
* Document backup and recovery procedures.

Remote customer access must be designed separately with appropriate security controls.

⸻

15. Project Status Awareness

The project is currently in its initial architecture and development phase.

Do not assume that planned features are already implemented.

Before modifying code, inspect the actual repository.

Distinguish clearly between:

* Planned functionality.
* Implemented functionality.
* Tested functionality.
* Approved functionality.

Never fabricate implementation progress.

⸻

16. Final Development Principles

Every technical decision should support at least one of the following objectives:

1. Improve software quality.
2. Improve maintainability.
3. Reduce unnecessary coupling.
4. Increase module cohesion.
5. Improve security.
6. Improve testability.
7. Preserve collaborative development.
8. Maintain compatibility with local deployment.

Final Rule:

Do not optimize for generating the largest amount of code.

Optimize for producing correct, secure, understandable, maintainable, and testable software.

When uncertain about a major architectural decision, ask before implementing.