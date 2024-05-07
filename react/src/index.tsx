import '../styles/tailwind.css';
import '../styles/index.less';
// import "../static/fonts/proxima-nova.css";

import React, { ReactNode, useEffect, useState } from 'react';
import { Chart as _Chart } from './Chart';
import { CanvasInner } from './Canvas';
import useCanvasState from './state/useCanvasState';
import isEmpty from 'lodash/isEmpty';
import { buildUrl, convertFilterParams } from './util/util';
import { EmbedResponse } from './types/EmbedResponse';

type CanvasProps = {
    canvasId: string;
    authToken: string;
    host?: string;
};

type CanvasSnapshotProps = {
    canvasData: EmbedResponse;
};

const API_BASE_URL = 'https://api.canvasapp.com';

export const Canvas: React.FC<CanvasProps> = ({ canvasId, authToken, host: hostOverride }: CanvasProps) => {
    const [canvasData, setCanvasData] = useState<EmbedResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dataHash, setDataHash] = useState<string>(Math.random().toString(36).substring(7));
    const [loading, setLoading] = useState(false);
    const host = hostOverride || API_BASE_URL;
    const { filters, sorts } = useCanvasState((state) => state);

    useEffect(() => {
        setLoading(true);
        fetch(
            buildUrl(`${host}/v1/embed/canvas_embed`, {
                canvas_id: canvasId,
                ...(!isEmpty(filters) && convertFilterParams(filters)),
                sorts: JSON.stringify(sorts),
            }),
            {
                method: 'GET',
                headers: {
                    'x-embed-key': authToken,
                },
            },
        )
            .then(async (res) => {
                setLoading(false);
                const canvasData = await res.json();
                if (!res.ok) {
                    console.error(`Error getting canvas data: ${JSON.stringify(canvasData)}`);
                    setCanvasData(null);
                    setError(canvasData.message);
                } else {
                    setCanvasData(canvasData);
                    setDataHash(Math.random().toString(36).substring(7));
                    setError(null);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log(`Error getting canvas data: ${error}`);
                setError(`Network error - either the server is down or you are offline`);
                setCanvasData(null);
            });
    }, [authToken, canvasId, filters, host, sorts]);

    const downloadCsv = (elementId: string, title: string) => {
        setLoading(true);
        fetch(
            buildUrl(`${host}/v1/embed/canvas_embed_csv`, {
                canvas_id: canvasId,
                element_id: elementId,
                ...(!isEmpty(filters) && convertFilterParams(filters)),
            }),
            {
                method: 'GET',
                headers: {
                    'x-embed-key': authToken,
                },
            },
        )
            .then(async (res) => {
                setLoading(false);
                const canvasData = await res.json();
                const downloadLink = document.createElement('a');
                downloadLink.href = canvasData.signedUrl;
                downloadLink.download = `${title}.csv`;
                downloadLink.click();
            })
            .catch((error) => {
                setLoading(false);
                console.log(`Error getting CSV data data: ${error}`);
                setError(`Network error - either the server is down or you are offline`);
            });
    };

    if (error) {
        return (
            <TailwindWrapper>
                <div className="flex flex-col gap-3">
                    <div className="text-red-500 text-xl">
                        <strong className="mr-1">Error_: </strong>
                        <span>{error}</span>
                    </div>
                    <div className="text-red-500">
                        Canvas embed instructions can be viewed{' '}
                        <a
                            href="https://canvasapp.com/docs/building-canvases/embeds"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            here
                        </a>
                    </div>
                </div>
            </TailwindWrapper>
        );
    }
    if (canvasData) {
        return (
            <TailwindWrapper>
                <CanvasInner canvasData={canvasData} dataHash={dataHash} loading={loading} downloadCsv={downloadCsv} />
            </TailwindWrapper>
        );
    }
};

export const CanvasSnapshot: React.FC<CanvasSnapshotProps> = ({ canvasData }: CanvasSnapshotProps) => {
    return (
        <TailwindWrapper>
            <CanvasInner canvasData={canvasData} loading={false} />
        </TailwindWrapper>
    );
};

function TailwindWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="canvas-embed" style={{ display: 'flex', flex: 1 }}>
            {children}
        </div>
    );
}
