import { create } from 'zustand';

// (filter_name, filter value)
type Filter = Record<string, string>;

interface CanvasState {
    filters: Filter;
    updateFilter: (filters: Filter) => void;
}

/** State */

const stateFn: (set: any, get: any) => CanvasState = (set, get) => ({
    filters: {},
    updateFilter: (filters: Filter) => {
        set((state: CanvasState) => ({
            ...state,
            filters: {
                ...state.filters,
                ...filters,
            },
        }));
    },
});

const useCanvasState = create<CanvasState>(stateFn);

export default useCanvasState;
