import { ComponentEmbed } from './rust_types/ComponentEmbed';
import { EmbedElement } from './rust_types/EmbedElement';

export type ComponentEmbedElement = EmbedElement & { elementType: { type: 'component' } & ComponentEmbed };
