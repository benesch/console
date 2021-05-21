export interface K8sDeployment {
  status: string;
}

export interface PendingMigration {
  deadline: string;
  description: string;
}

export interface Deployment {
  id: string;
  name: string;
  state: string;
  hostname: string;
  mzVersion: string;
  orchestratorDeployment: K8sDeployment;
  pendingMigration: PendingMigration | null;
}
