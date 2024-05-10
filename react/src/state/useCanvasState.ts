import { create } from 'zustand';
import { SelectOption } from '../components/MultiSelectInput';
import { EmbedSort } from '../__rust_generated__/EmbedSort';

// (filter_name, filter value)
type Filter = Record<string, SelectOption[]>;

interface CanvasState {
    filters: Filter;
    updateFilter: (variable: string, options: SelectOption[]) => void;
    sorts: Record<string, EmbedSort>;
    updateSort: (storeId: string, sort: EmbedSort) => void;
}

/** State */

const stateFn: (set, get) => CanvasState = (set, get) => ({
    filters: {},
    sorts: {},
    updateFilter: (variable: string, options: SelectOption[]) => {
        set((state: CanvasState) => {
            const newFilters = {
                ...state.filters,
            };
            if (options.length === 0) {
                delete newFilters[variable];
            } else {
                newFilters[variable] = options;
            }
            return {
                ...state,
                filters: newFilters,
            };
        });
    },
    updateSort: (storeId: string, sort: EmbedSort) => {
        set((state: CanvasState) => {
            const newSort = {
                ...state.sorts,
                [storeId]: sort,
            };
            return {
                ...state,
                sorts: newSort,
            };
        });
    },
});

const useCanvasState = create<CanvasState>(stateFn);

export default useCanvasState;
