import { GetCanvasEmbedResponse } from '../__rust_generated__/GetCanvasEmbedResponse';
import { Theme } from '../components/layout/themes/theme.util';

export interface EmbedResponse extends GetCanvasEmbedResponse {
    theme?: Theme;
}