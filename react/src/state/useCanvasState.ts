import { create } from 'zustand';
import { SelectOption } from '../components/MultiSelectInput';

// (filter_name, filter value)
type Filter = Record<string, SelectOption[]>;

interface CanvasState {
    filters: Filter;
    updateFilter: (filters: Filter) => void;
}

/** State */

const stateFn: (set, get) => CanvasState = (set, get) => ({
    filters: {},
    updateFilter: (filters: Filter) => {
        set((state: CanvasState) => {
            const newFilters = {
                ...state.filters,
                ...filters,
            };
            return {
                ...state,
                filters: newFilters,
            };
        });
    },
});

const useCanvasState = create<CanvasState>(stateFn);

export default useCanvasState;
