export interface SdlcStage {
  id: string;
  name: string;
  thinkingSteps: string[];
  /** keywords used to fuzzy-match the API's architecture.roles to a stage */
  roleKeywords: string[];
}

export const SDLC_STAGES: SdlcStage[] = [
  {
    id: "requirements",
    name: "Requirements",
    roleKeywords: ["requirement", "discovery", "analysis", "spec"],
    thinkingSteps: [
      "Legacy system audit & inventory",
      "Migration scope definition",
      "Dependency mapping",
      "Risk assessment matrix",
      "Stakeholder sign-off docs",
    ],
  },
  {
    id: "architecture",
    name: "Architecture",
    roleKeywords: ["architect", "design", "planner"],
    thinkingSteps: [
      "Target architecture design (HLD/LLD)",
      "Microservices decomposition plan",
      "Data migration strategy",
      "API gateway design",
      "Strangler fig pattern mapping",
    ],
  },
  {
    id: "development",
    name: "Development",
    roleKeywords: ["develop", "code", "build", "implement", "engineer"],
    thinkingSteps: [
      "Service scaffolding & boilerplate",
      "Database schema migration scripts",
      "API endpoint implementation",
      "Legacy adapter/wrapper code",
      "Feature parity validation",
    ],
  },
  {
    id: "code-review",
    name: "Code Review",
    roleKeywords: ["review", "lint", "quality", "static"],
    thinkingSteps: [
      "Breaking change detection",
      "Backward compatibility checks",
      "Security vulnerability scan",
      "Code quality & lint enforcement",
      "Dependency audit",
    ],
  },
  {
    id: "testing",
    name: "Testing",
    roleKeywords: ["test", "qa", "verification"],
    thinkingSteps: [
      "Regression test suites",
      "Integration tests (old ↔ new)",
      "Load & performance benchmarks",
      "Data migration validation tests",
      "Rollback scenario testing",
    ],
  },
  {
    id: "documentation",
    name: "Documentation",
    roleKeywords: ["doc", "writer", "knowledge"],
    thinkingSteps: [
      "Migration runbooks",
      "Architecture decision records (ADRs)",
      "API changelog & versioning docs",
      "Rollback procedures",
      "Team onboarding guides",
    ],
  },
  {
    id: "deployment",
    name: "Deployment",
    roleKeywords: ["deploy", "release", "devops", "ci", "cd", "ops"],
    thinkingSteps: [
      "Blue-green deployment setup",
      "Feature flag configuration",
      "Database migration CI/CD",
      "Canary release pipelines",
      "Monitoring & alerting setup",
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance",
    roleKeywords: ["maintain", "support", "monitor", "incident", "sre"],
    thinkingSteps: [
      "Legacy system decommission plan",
      "Performance monitoring dashboards",
      "Incident response playbooks",
      "Technical debt tracking",
      "Post-migration optimization",
    ],
  },
];
