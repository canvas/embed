import { ComponentEmbed } from './__rust_generated__/ComponentEmbed';
import { EmbedElement } from './__rust_generated__/EmbedElement';

export type ComponentEmbedElement = EmbedElement & { elementType: { type: 'component' } & ComponentEmbed };
