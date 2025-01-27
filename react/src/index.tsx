import '../styles/tailwind.css';
import '../styles/index.less';

import React, { ReactNode, useEffect, useState } from 'react';
import { CanvasInner } from './Canvas';
import useCanvasState from './state/useCanvasState';
import isEmpty from 'lodash/isEmpty';
import { buildUrl, convertFilterParams } from './util/util';
import { EmbedResponse } from './types/EmbedResponse';
import { Spinner } from './Spinner';

type CanvasProps = {
    canvasId: string;
    authToken?: string;
    host?: string;
    onError?: (error: string) => void;
};

type CanvasSnapshotProps = {
    canvasData: EmbedResponse;
};

const API_BASE_URL = 'https://api.canvasapp.com';

export const Canvas: React.FC<CanvasProps> = ({ canvasId, authToken, host: hostOverride, onError }: CanvasProps) => {
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
                headers: authToken ? { 'x-embed-key': authToken } : undefined,
            },
        )
            .then(async (res) => {
                const canvasData = await res.json();
                setLoading(false);
                if (!res.ok) {
                    console.error(`Error getting canvas data: ${JSON.stringify(canvasData)}`);
                    setCanvasData(null);
                    setError(canvasData.message);
                    if (onError) {
                        onError(canvasData.message);
                    }
                } else {
                    setCanvasData(canvasData);
                    setDataHash(Math.random().toString(36).substring(7));
                    setError(null);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log(`Error getting canvas data: ${error}`);
                const message = `Network error - either the server is down or you are offline`;
                setError(message);
                if (onError) {
                    onError(message);
                }
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
                headers: authToken ? { 'x-embed-key': authToken } : undefined,
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
        console.error(`Error fetching embed data: ${error}`);

        return '';
    }

    if (canvasData) {
        return (
            <TailwindWrapper>
                <div dangerouslySetInnerHTML={{ __html: `<!-- ${process.env.REACT_APP_VERSION} -->` }} />
                <CanvasInner canvasData={canvasData} dataHash={dataHash} downloadCsv={downloadCsv} />
            </TailwindWrapper>
        );
    }

    if (loading) {
        return (
            <TailwindWrapper>
                <Spinner />
            </TailwindWrapper>
        );
    }
};

export const CanvasSnapshot: React.FC<CanvasSnapshotProps> = ({ canvasData }: CanvasSnapshotProps) => {
    return (
        <TailwindWrapper>
            <CanvasInner canvasData={canvasData} />
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
