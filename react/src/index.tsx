import '../styles/tailwind.css';
import '../styles/index.less';
// import "../static/fonts/proxima-nova.css";

import React, { useEffect, useState } from 'react';
import { Chart as _Chart, ChartData as InnerChartData } from './Chart';
import { CanvasInner } from './Canvas';
import { GetCanvasEmbedResponse } from './rust_types/GetCanvasEmbedResponse';
import useCanvasState from './state/useCanvasState';
import isEmpty from 'lodash/isEmpty';
import { buildUrl, stripDollarPrefix } from './util';

type CanvasProps = {
    canvasId: string;
    authToken: string;
    host?: string;
};

type WrapperProps = {
    authToken: string;
    chartId: string;
    timezone: string | null;
    disableExport?: boolean;
    host?: string;
};

const API_BASE_URL = 'https://api.canvasapp.com';

export const Canvas: React.FC<CanvasProps> = ({ canvasId, authToken, host: hostOverride }: CanvasProps) => {
    const [canvasData, setCanvasData] = useState<GetCanvasEmbedResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dataHash, setDataHash] = useState<string>(Math.random().toString(36).substring(7));
    const host = hostOverride || API_BASE_URL;
    const filters = useCanvasState((state) => state.filters);

    useEffect(() => {
        // fetch(`${host}/v1/embed/canvas_embed?canvas_id=${canvasId}${!isEmpty(filters) ? '&select_2=9338' : ''}`, {
        fetch(
            buildUrl(`${host}/v1/embed/canvas_embed`, {
                canvas_id: canvasId,
                ...(!isEmpty(filters) && stripDollarPrefix(filters)),
            }),
            {
                method: 'GET',
                headers: {
                    'x-embed-key': authToken,
                },
            },
        )
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error(`Error getting canvas data: ${text}`);
                    setCanvasData(null);
                    setError(text);
                } else {
                    const chartData = await res.json();
                    setCanvasData(chartData);
                    setDataHash(Math.random().toString(36).substring(7));
                    setError(null);
                }
            })
            .catch((error) => {
                console.log(`Error getting canvas data: ${error}`);
                setError(`${error}`);
                setCanvasData(null);
            });
    }, [authToken, canvasId, filters]);

    if (error) {
        return <div>{error}</div>;
    }
    if (canvasData) {
        return <CanvasInner canvasData={canvasData} dataHash={dataHash} />;
    }
};

export const Chart: React.FC<WrapperProps> = ({
    authToken,
    chartId,
    timezone,
    disableExport,
    host: hostOverride,
}: WrapperProps) => {
    const [chartData, setChartData] = useState<InnerChartData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const host = hostOverride || API_BASE_URL;

    useEffect(() => {
        if (!authToken) {
            console.warn('Missing authToken');
            return;
        }
        if (!chartId) {
            console.warn('Missing chartId');
            return;
        }
        fetch(`${host}/v1/embed/embed_data?embed_id=${chartId}`, {
            method: 'GET',
            headers: {
                'x-embed-key': authToken,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error(`Error getting chart data: ${text}`);
                    setChartData(null);
                    setError(text);
                } else {
                    const chartData = await res.json();
                    setChartData(chartData);
                    setError(null);
                }
            })
            .catch((error) => {
                console.error(`Error getting embed data: ${error}`);
                setError(`${error}`);
                setChartData(null);
            });
    }, [authToken, chartId]);

    if (error) {
        return <div>{error}</div>;
    }

    if (chartData) {
        return <_Chart data={chartData} title="Title" timezone={timezone} disableExport={disableExport} />;
    } else {
        return <_Chart data={undefined} title="Title" timezone={timezone} />;
    }
};
