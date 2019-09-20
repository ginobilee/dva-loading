export interface DvaLoadingState {
  global: boolean;
  models: { [type: string]: boolean | undefined };
  effects: { [type: string]: boolean | undefined };
  localEffects: { [type: string]: boolean | undefined };
}
