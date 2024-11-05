import { ProjectInsight } from './insightTypes';

export type ProjectMapCallback = (project: ProjectInsight, index: number) => JSX.Element;
export type TagMapCallback = (tag: string, index: number) => JSX.Element;
export type TaskMapCallback = (task: string, index: number) => JSX.Element;