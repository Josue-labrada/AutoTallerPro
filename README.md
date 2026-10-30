🚗 AutoTaller Pro 🚗

Sistema de Gestión Inteligente para Talleres Mecánicos

AutoTaller Pro es una plataforma B2B/B2C diseñada para digitalizar y optimizar la recepción, diagnóstico, reparación y seguimiento de vehículos en talleres mecánicos.

El sistema está desarrollado como proyecto académico de la materia Calidad de Software, aplicando principios de ingeniería de software, arquitectura modular, alta cohesión, bajo acoplamiento y aseguramiento de calidad.

Objetivo

Desarrollar una plataforma que permita a los talleres mecánicos administrar sus operaciones y ofrecer a los clientes herramientas digitales para consultar el estado de sus vehículos.

El sistema está diseñado para ejecutarse en infraestructura local (On-Premise), reduciendo la dependencia de servicios en la nube.

Arquitectura

El proyecto seguirá inicialmente una arquitectura de monolito modular.

Principios de diseño

* Alta cohesión.
* Bajo acoplamiento.
* Principios SOLID.
* Separación de responsabilidades.
* Arquitectura modular.
* Seguridad desde el diseño.
* Código mantenible y verificable.

La arquitectura se documentará mediante un Software Design Description (SDD).

Funcionalidades

Módulo Operativo

Dirigido a mecánicos y administradores.

1. Registro de vehículos

Permite registrar vehículos mediante datos como:

* Placa.
* Modelo.
* Marca.
* Kilometraje.
* Información de recepción.

2. Mapeo visual de daños

Interfaz interactiva que permite seleccionar zonas del vehículo y registrar daños, observaciones e instrucciones.

3. Tablero Kanban

Administración de órdenes de trabajo mediante cuatro estados:

* En Recepción.
* En Diagnóstico.
* En Reparación.
* Listo para Entrega.

4. Registro de servicios y costos

Permite registrar servicios, insumos y calcular los subtotales de las órdenes.

Módulo de Clientes

1. Seguimiento de vehículos

Consulta del estado de reparación mediante un mecanismo de acceso seguro.

2. Calculadora de combustible

Herramienta para estimar el consumo y costo de combustible utilizando distancia, rendimiento y precio por litro.

3. Alertas de mantenimiento

Indicadores visuales que informan cuándo corresponde realizar el siguiente servicio.

Tecnologías propuestas

Tecnología	Función
React	Interfaz de usuario
TypeScript	Desarrollo frontend
Node.js	Backend propuesto
PostgreSQL	Base de datos relacional
MinIO	Almacenamiento de imágenes
Docker	Contenedores
Docker Compose	Orquestación local
Git	Control de versiones
GitHub	Colaboración y repositorio

El stack podrá ajustarse durante la fase de diseño.

Estructura del proyecto

AutoTaller-Pro/
├── backend/
├── frontend/
├── database/
├── docs/
├── .github/
├── .env.example
├── .gitignore
├── AGENTS.md
├── CONTRIBUTING.md
├── docker-compose.yml
└── README.md

Seguridad

El repositorio es público.

Por motivos de seguridad:

* No se almacenarán contraseñas reales.
* No se publicarán API keys.
* No se incluirán archivos .env con credenciales.
* No se publicarán datos personales de clientes.
* Las configuraciones sensibles se administrarán mediante variables de entorno.
* Se utilizarán archivos de ejemplo para documentar la configuración.

Calidad de Software

El proyecto contempla:

* Pruebas unitarias.
* Pruebas de integración.
* Validación de entradas.
* Revisión de código.
* Análisis de mantenibilidad.
* Matriz de trazabilidad de requisitos.
* Evaluación de características de calidad basadas en ISO/IEC 25010.

Desarrollo asistido por IA

El equipo podrá utilizar herramientas de inteligencia artificial como apoyo para:

* Análisis de arquitectura.
* Generación y revisión de código.
* Refactorización.
* Creación de pruebas.
* Documentación técnica.
* Identificación de riesgos.

Las herramientas de IA deberán respetar las instrucciones establecidas en AGENTS.md.

Equipo de Desarrollo

Proyecto académico desarrollado por:

* Alejandro Fernández Vázquez.
* Paulina Flores Sánchez.
* Josué Domínguez Labrada.

Estado del proyecto

Etapa 1: Planificación y diseño arquitectónico.

Las funcionalidades descritas representan el alcance propuesto y no deben interpretarse como funcionalidades ya implementadas.

Licencia
Licencia MIT 
