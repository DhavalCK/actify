export interface Action {
    id: string;
    title: string;
    done: boolean;
    createdAt: number;
    doneAt?: number | null;
}