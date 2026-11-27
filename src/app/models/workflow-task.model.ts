export interface PraticienWorkflowTask {
  id: string;
  processInstanceId: string;
  rendezVousId: string;
  definitionKey: string;
  name: string;
  createdAt: string;
}

export interface CompleteWorkflowTaskRequest {
  variables: Record<string, unknown>;
}
