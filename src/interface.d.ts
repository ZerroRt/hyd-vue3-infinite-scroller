export type ScrollerOptions = {
  threshold: number;
  detactTop: boolean;
  detactBottom: boolean;
}
export enum LoadDirection {
  Top = 'top',
  Bottom = 'bottom'
}

export type LoadDataFinish = (value: unknown) => void;
export type ScrollerEmits = {
  (e: 'loadMore', direction: LoadDirection, finish: LoadDataFinish): void;
}

export enum Detactors {
  Top = 'detactor-top',
  Bottom = 'detactor-bottom'
}